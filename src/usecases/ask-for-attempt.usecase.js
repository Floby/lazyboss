const delay = require('delay')
const uuid = require('uuid/v4')
const { NoJobForWorkerError } = require('../domain/errors')
const Attempt = require('../domain/attempt')
const Vacancy = require('../domain/vacancy')

module.exports = AskForAttempt

function AskForAttempt (jobsRepository, assignmentService, jobAnnouncer, timeout) {
  return async function (workerCredentials) {
    const vacancy = Vacancy.forWorker(workerCredentials)
    let attempt
    attempt = await attemptNextJob()
    if (attempt) {
      return attempt
    }
    const timeoutReject = delay.reject(timeout, { value: new NoJobForWorkerError(workerCredentials) })
    while (!attempt) {
      await Promise.race([
        timeoutReject,
        jobAnnouncer.awaitJobs()
      ])
      attempt = await attemptNextJob()
    }
    timeoutReject.clear()
    return attempt

    async function attemptNextJob() {
      const [ job ] = await jobsRepository.listPending()
      if (job) {
        const attempt = await assignmentService.assignVacancyToJob(vacancy, job)
        await jobsRepository.save(job)
        return attempt
      }
    }
  }
}

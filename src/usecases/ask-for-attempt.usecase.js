const delay = require('delay')
const uuid = require('uuid/v4')
const { NoJobForWorkerError } = require('../domain/errors')
const Attempt = require('../domain/attempt')
const Vacancy = require('../domain/vacancy')

module.exports = AskForAttempt

function AskForAttempt (jobsRepository, attemptsRepository, vacanciesRepositoryStub, timeout) {
  return async function (workerCredentials) {
    let jobToAttempt
    const vacancy = Vacancy.forWorker(workerCredentials)
    await vacanciesRepositoryStub.save(vacancy)
    const previsouslyPendingJobs = await jobsRepository.listPending()
    if (previsouslyPendingJobs.length) {
      [ jobToAttempt ] = previsouslyPendingJobs
    } else {
      jobToAttempt = await Promise.race([
        jobsRepository.observePending(),
        rejectAfterTimeout(timeout, NoJobForWorkerError, workerCredentials)
      ])
    }
    const attempt = jobToAttempt.assign(workerCredentials)
    await Promise.all([
      attemptsRepository.save(attempt),
      jobsRepository.save(jobToAttempt)
    ])
    return attempt
  }
}

async function rejectAfterTimeout (ms, ErrorType, ...errorArgs) {
  await delay(ms)
  throw new ErrorType(...errorArgs)
}


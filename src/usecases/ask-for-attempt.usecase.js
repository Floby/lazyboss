const delay = require('delay')
const uuid = require('uuid/v4')
const { NoJobForWorkerError } = require('../domain/errors')

module.exports = AskForAttempt

function AskForAttempt (jobsRepository, attemptsRepository, timeout) {
  return async function (workerCredentials) {
    const pendingJob = await Promise.race([
      jobsRepository.observePending(),
      rejectAfterTimeout(timeout, NoJobForWorkerError, workerCredentials)
    ])
    const attempt = {
      worker: workerCredentials,
      job: pendingJob,
      id: uuid()
    }
    await attemptsRepository.save(attempt)
    return attempt
  }
}

async function rejectAfterTimeout (ms, ErrorType, ...errorArgs) {
  await delay(ms)
  throw new ErrorType(...errorArgs)
}


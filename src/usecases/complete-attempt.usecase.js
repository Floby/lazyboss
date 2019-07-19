const { WrongWorkerError, UnknownAttemptError } = require('../domain/errors')
module.exports = CompleteAttempt

function CompleteAttempt (jobsRepository, attemptsRepository, assignmentsRepository) {
  return async (jobId, attemptId, worker, result) => {
    const attempt = await attemptsRepository.get(attemptId)
    if (!attempt || attempt.job.id !== jobId) {
      throw new UnknownAttemptError(attemptId, jobId)
    }
    if (attempt.worker.id !== worker.id) {
      throw new WrongWorkerError(worker, attempt.worker)
    }
    attempt.finish(result)
    await attemptsRepository.save(attempt)
    await jobsRepository.save(attempt.job)
    await assignmentsRepository.unset({ jobId, attemptId })
  }
}

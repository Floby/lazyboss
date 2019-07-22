exports.UnknownJobError = class UnknownJobError extends Error {
  constructor(jobId) {
    super(`Unknown job with id "${jobId}"`)
  }
}

exports.UnknownAttemptError = class UnknownAttemptError extends Error {
  constructor(attemptId, jobId) {
    super(`Unknown attempt with id "${attemptId}" for job "${jobId}"`)
  }
}

exports.NoJobForWorkerError = class NoJobForWorkerError extends Error {
  constructor(worker) {
    super(`Nothing to do for worker "${worker.id}"`)
  }
}

exports.AttemptAlreadyFinishedError = class AttemptAlreadyFinishedError extends Error {
  constructor(completionType) {
    super(`Attempt already has a ${completionType}`)
  }
}

exports.JobLifeCycleError = class JobLifeCycleError extends Error {
  constructor(previousStatus, triedTransition) {
    super(`Job cannot become "${triedTransition}" when it is "${previousStatus}"`)
  }
}

exports.WrongWorkerError = class WrongWorkerError extends Error {
  constructor(worker, expected) {
    super(`Worker "${worker.id}" is not the one that was expected. expected ${expected.id}`)
  }
}

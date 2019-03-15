exports.UnknownJobError = class UnknownJobError extends Error {
  constructor(jobId) {
    super(`Unknown job with id "${jobId}"`)
  }
}

exports.NoJobForWorkerError = class NoJobForWorkerError extends Error {
  constructor(worker) {
    super(`Nothing to do for worker "${worker.id}"`)
  }
}

exports.UnknownJobError = class UnknownJobError extends Error {
  constructor(jobId) {
    super(`Unknown job with id "${jobId}"`)
  }
}

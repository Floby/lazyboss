const { UnknownJobError } = require('../domain/errors')

module.exports = GetJob

function GetJob (jobsRepository) {
  return async function (jobId) {
    const job = await jobsRepository.get(jobId)
    if (!job) {
      throw new UnknownJobError(jobId)
    }
    return job
  }
}

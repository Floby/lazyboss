const Job = require('../domain/job')

module.exports = CreateJob

function CreateJob (jobsRepository, jobAnnouncer) {
  return async function (jobCreationCommand) {
    const job = Job({
      type: jobCreationCommand.type,
      parameters: jobCreationCommand.parameters
    })
    await jobsRepository.save(job)
    jobAnnouncer.announceJobs()
    return job
  }
}

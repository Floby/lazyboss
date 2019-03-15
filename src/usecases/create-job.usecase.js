const Job = require('../domain/job')

module.exports = CreateJob

function CreateJob (jobsRepository) {
  return async function (jobCreationCommand) {
    const job = Job({
      type: jobCreationCommand.type,
      parameters: jobCreationCommand.parameters
    })
    await jobsRepository.save(job)
    return job
  }
}

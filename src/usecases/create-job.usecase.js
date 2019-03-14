const clone = require('clone-deep')
const uuid = require('uuid/v4')

module.exports = CreateJob

function CreateJob (jobsRepository) {
  return async function (jobCreationCommand) {
    const job = {
      id: uuid(),
      type: jobCreationCommand.type,
      parameters: clone(jobCreationCommand.parameters)
    }
    await jobsRepository.save(job)
    return job
  }
}

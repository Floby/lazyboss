const uuid = require('uuid/v4')

module.exports = CreateJob

function CreateJob (jobsRepository) {
  return async function (jobCreationCommand) {
    const createdId = uuid()
    const job = { id: createdId }
    await jobsRepository.save(job)
    return createdId
  }
}

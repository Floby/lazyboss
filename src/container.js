const JobsRepository = require('./infra/jobs.repository')
const GetJob = require('./usecases/get-job.usecase')
const CreateJob = require('./usecases/create-job.usecase')

module.exports = Container

function Container (config) {
  const repositories = {}
  const usecases = {}

  repositories.jobsRepository = JobsRepository()
  usecases.getJob = GetJob(repositories.jobsRepository)
  usecases.createJob = CreateJob(repositories.jobsRepository)

  return { repositories, usecases }
}

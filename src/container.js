const ms = require('ms')
const JobsRepository = require('./infra/jobs.repository')
const AttemptsRepository = require('./infra/attempts.repository')
const AskForAttempt = require('./usecases/ask-for-attempt.usecase')
const CreateJob = require('./usecases/create-job.usecase')
const GetJob = require('./usecases/get-job.usecase')

module.exports = Container

function Container (config) {
  const repositories = {}
  const usecases = {}

  repositories.jobsRepository = JobsRepository()
  repositories.attemptsRepository = AttemptsRepository()
  usecases.getJob = GetJob(repositories.jobsRepository)
  usecases.createJob = CreateJob(repositories.jobsRepository)
  usecases.askForAttempt = AskForAttempt(repositories.jobsRepository, repositories.attemptsRepository, ms('20 seconds'))

  return { repositories, usecases }
}

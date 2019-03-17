const ms = require('ms')
const JobsRepository = require('./infra/jobs.repository')
const AttemptsRepository = require('./infra/attempts.repository')
const AskForAttempt = require('./usecases/ask-for-attempt.usecase')
const CreateJob = require('./usecases/create-job.usecase')
const GetJob = require('./usecases/get-job.usecase')
const CompleteAttempt = require('./usecases/complete-attempt.usecase')

module.exports = Container

function Container (config) {
  const repositories = {}
  const usecases = {}
  const pollingTimeout = config.get('LONG_POLLING_TIMEOUT')

  repositories.jobsRepository = JobsRepository()
  repositories.attemptsRepository = AttemptsRepository()
  usecases.getJob = GetJob(repositories.jobsRepository)
  usecases.createJob = CreateJob(repositories.jobsRepository)
  usecases.askForAttempt = AskForAttempt(repositories.jobsRepository, repositories.attemptsRepository, pollingTimeout)
  usecases.completeAttempt = CompleteAttempt(repositories.jobsRepository, repositories.attemptsRepository)

  return { repositories, usecases }
}

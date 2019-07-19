const ms = require('ms')
const JobsRepository = require('./infra/jobs.repository')
const JobAnnouncer = require('./infra/job.announcer')
const AttemptsRepository = require('./infra/attempts.repository')
const AssignmentsRepository = require('./infra/assignments.repository')
const VacanciesRespository = require('./infra/vacancies.repository')
const AssignmentService = require('./domain/assignment.service')
const AskForAttempt = require('./usecases/ask-for-attempt.usecase')
const CreateJob = require('./usecases/create-job.usecase')
const GetJob = require('./usecases/get-job.usecase')
const CompleteAttempt = require('./usecases/complete-attempt.usecase')

module.exports = Container

function Container (config) {
  const services = {}
  const repositories = {}
  const usecases = {}
  const pollingTimeout = config.get('LONG_POLLING_TIMEOUT')

  repositories.jobsRepository = JobsRepository()
  repositories.attemptsRepository = AttemptsRepository()
  repositories.assignmentsRepository = AssignmentsRepository()
  repositories.vacanciesRepository = VacanciesRespository()
  repositories.jobAnnouncer = JobAnnouncer()
  services.assignmentService = AssignmentService(repositories.attemptsRepository, repositories.assignmentsRepository)
  usecases.getJob = GetJob(repositories.jobsRepository)
  usecases.createJob = CreateJob(repositories.jobsRepository, repositories.jobAnnouncer)
  usecases.askForAttempt = AskForAttempt(repositories.jobsRepository, services.assignmentService, repositories.jobAnnouncer, pollingTimeout)
  usecases.completeAttempt = CompleteAttempt(repositories.jobsRepository, repositories.attemptsRepository, repositories.assignmentsRepository)

  return { repositories, usecases }
}

const Attempt = require('./attempt')

module.exports = AssignmentService

function AssignmentService (attemptsRepository, assignmentsRepository) {
  if(!(this instanceof AssignmentService)) return new AssignmentService(...arguments)
  this.assignVacancyToJob = async (vacancy, job) => {
    const attempt = job.assign(vacancy.worker)
    await attemptsRepository.save(attempt)
    const assignment = {
      jobId: job.id,
      attemptId: attempt.id
    }
    try {
      await assignmentsRepository.set(assignment)
      return attempt
    } catch (error) {
      await attemptsRepository.remove(attempt.id)
      return null
    }
  }
}

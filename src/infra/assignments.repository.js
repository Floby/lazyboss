module.exports = AssignmentsRepository

function AssignmentsRepository () {
  if (!(this instanceof AssignmentsRepository)) return new AssignmentsRepository()
  const assignments = []
  this.set = async (assignment) => {
    const conflicting = assignments.filter(({ jobId, attemptId }) => {
      const sameJob = jobId === assignment.jobId
      const sameAttempt = attemptId === assignment.attemptId
      return (sameJob || sameAttempt) && !(sameJob && sameAttempt)
    })
    if (conflicting.length) {
      throw Error ('Job already assigned')
    }
    assignments.push(assignment)
  }
}

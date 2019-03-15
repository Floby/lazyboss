module.exports = AttemptsRepository

function AttemptsRepository () {
  if (!(this instanceof AttemptsRepository)) return new AttemptsRepository()

  const attempts = {}

  this.save = async (attempt) => {
    attempts[attempt.id] = attempt
  }

  this.get = async (attemptId) => {
    return attempts[attemptId]
  }
}

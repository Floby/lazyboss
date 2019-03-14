module.exports = MemoryJobsRepository

function MemoryJobsRepository () {
  if (!(this instanceof MemoryJobsRepository)) return new MemoryJobsRepository()

  const jobs = {}

  this.save = async (job) => {
    jobs[job.id] = job
  }

  this.get = async (jobId) => {
    return jobs[jobId]
  }
}

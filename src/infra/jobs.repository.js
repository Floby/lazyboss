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

  this.listPending = async () => {
    return Object.values(jobs).filter((job) => job.status === 'pending')
  }
}

const { EventEmitter } = require('events')
module.exports = MemoryJobsRepository

function MemoryJobsRepository () {
  if (!(this instanceof MemoryJobsRepository)) return new MemoryJobsRepository()

  const events = new EventEmitter()
  const jobs = {}

  this.save = async (job) => {
    jobs[job.id] = job
    if (job.status === 'pending') {
      events.emit('pending', job)
    }
  }

  this.get = async (jobId) => {
    return jobs[jobId]
  }

  this.observePending = () => {
    return new Promise((resolve, reject) => {
      events.once('pending', (job) => resolve(job))
    })
  }
}

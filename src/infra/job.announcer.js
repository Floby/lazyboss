const { EventEmitter } = require('events')

module.exports = JobAnnouncer

function JobAnnouncer () {
  if (!(this instanceof JobAnnouncer)) return new JobAnnouncer(...arguments)
  const announcer = new EventEmitter()
  this.awaitJobs = () => {
    return new Promise((resolve) => announcer.once('jobs!', resolve))
  }
  this.announceJobs = () => {
    announcer.emit('jobs!')
  }
}

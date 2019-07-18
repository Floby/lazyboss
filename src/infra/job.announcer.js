const { EventEmitter } = require('events')

module.exports = JobAnnouncer

function JobAnnouncer () {
  const announcer = new EventEmitter()
  this.awaitJobs = () => {
    return new Promise((resolve) => announcer.once('jobs!', resolve))
  }
  this.announceJobs = () => {
    announcer.emit('jobs!')
  }
}

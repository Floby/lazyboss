const shortid = require('shortid')

module.exports = Attempt

function Attempt ({ id, worker, job }) {
  id = id || shortid()
  this.toJSON = () => ({
    id, worker, job: job.toJSON()
  })
  getter(this, 'worker', worker)
  getter(this, 'job', job)
}

function getter (that, property, value) {
  Object.defineProperty(that, property, {
    value,
    writable: false
  })
}

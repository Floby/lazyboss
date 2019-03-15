const shortid = require('shortid')

module.exports = Attempt

function Attempt ({ id, worker, job }) {
  if (!(this instanceof Attempt)) return new Attempt(...arguments)
  id = id || shortid()
  this.toJSON = () => ({
    id, worker, job: job.toJSON()
  })
  getter(this, 'id', () => id)
  getter(this, 'worker', () => worker)
  getter(this, 'job', () => job)
}

function getter (that, property, get) {
  Object.defineProperty(that, property, {
    get
  })
}

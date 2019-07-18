const { requiredArg } = require('../helpers')
const clone = require('clone-deep')
const shortid = require('shortid')

module.exports = Attempt

function Attempt ({ id, worker, job=requiredArg('job'), result=null }) {
  if (!(this instanceof Attempt)) return new Attempt(...arguments)
  id = id || shortid()
  this.toJSON = () => ({
    id,
    worker,
    job: job.toJSON(),
    result
  })
  this.finish = (_result) => {
    result = clone(_result)
    job.complete(result)
  }

  getter(this, 'id', () => id)
  getter(this, 'worker', () => worker)
  getter(this, 'job', () => job)
  getter(this, 'result', () => result)
}

function getter (that, property, get) {
  Object.defineProperty(that, property, {
    get
  })
}

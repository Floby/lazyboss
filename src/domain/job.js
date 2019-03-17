const uuid = require('uuid/v4')
const clone = require('clone-deep')
const { JobLifeCycleError } = require('./errors')
const Attempt = require('./attempt')

module.exports = Job

function Job ({ id, status, type, parameters, assignee=null, result=null }) {
  if (!(this instanceof Job)) return new Job(...arguments)
  id = id || uuid()
  const params = clone(parameters) || {}
  status = status || 'pending'
  this.toJSON = () => ({
    id, type, parameters: params, status, assignee, result
  })

  this.assign = (worker) => {
    status = 'assigned'
    assignee = worker
    return new Attempt({ worker, job: this })
  }
  this.complete = (_result) => {
    result = clone(_result)
    if (status === 'done' || status === 'pending') {
      throw new JobLifeCycleError(status, 'done')
    }
    status = 'done'
  }

  getter(this, 'status', () => status)
  getter(this, 'id', () => id)
  getter(this, 'assignee', () => assignee)
  getter(this, 'result', () => result)
}

function getter (that, property, get) {
  Object.defineProperty(that, property, {
    get
  })
}

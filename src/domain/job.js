const uuid = require('uuid/v4')
const clone = require('clone-deep')
const Attempt = require('./attempt')

module.exports = Job

function Job ({ id, status, type, parameters, assignee }) {
  if (!(this instanceof Job)) return new Job(...arguments)
  id = id || uuid()
  const params = clone(parameters) || {}
  status = status || 'pending'
  this.toJSON = () => ({
    id, type, parameters: params, status, assignee
  })

  this.assign = (worker) => {
    status = 'assigned'
    assignee = worker
    return new Attempt({ worker, job: this })
  }

  getter(this, 'status', () => status)
  getter(this, 'id', () => id)
  getter(this, 'assignee', () => assignee || null)
}

function getter (that, property, get) {
  Object.defineProperty(that, property, {
    get
  })
}

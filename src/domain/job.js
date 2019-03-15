const uuid = require('uuid/v4')
const clone = require('clone-deep')
const Attempt = require('./attempt')

module.exports = Job

function Job ({ id, status, type, parameters }) {
  if (!(this instanceof Job)) return new Job(...arguments)
  id = id || uuid()
  const params = clone(parameters) || {}
  status = status || 'pending'
  this.toJSON = () => ({
    id, type, parameters: params, status
  })

  this.assign = (worker) => {
    status = 'working'
    return new Attempt({ worker, job: this })
  }
}

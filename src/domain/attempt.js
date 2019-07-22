const { requiredArg } = require('../helpers')
const clone = require('clone-deep')
const shortid = require('shortid')
const { AttemptAlreadyFinishedError } = require('./errors')

module.exports = Attempt

function Attempt ({ id, worker, job=requiredArg('job'), result=null, failure=null }) {
  if (!(this instanceof Attempt)) return new Attempt(...arguments)
  id = id || shortid()
  this.toJSON = () => ({
    id,
    worker,
    job: job.toJSON(),
    result,
    failure
  })
  this.finish = (_result) => {
    checkFinished(this)
    result = clone(_result)
    job.complete(result)
  }
  this.fail = (reason) => {
    checkFinished(this)
    failure = clone(reason)
    job.fail(reason)
  }

  getter(this, 'id', () => id)
  getter(this, 'worker', () => worker)
  getter(this, 'job', () => job)
  getter(this, 'result', () => result)
  getter(this, 'failure', () => failure)
}

function getter (that, property, get) {
  Object.defineProperty(that, property, {
    get
  })
}

function checkFinished (attempt) {
  if (attempt.failure) {
    throw new AttemptAlreadyFinishedError('failure')
  }
  if (attempt.result) {
    throw new AttemptAlreadyFinishedError('result')
  }
}

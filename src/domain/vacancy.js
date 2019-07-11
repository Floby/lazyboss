const clone = require('clone-deep')
const shortid = require('shortid')

module.exports = Vacancy

function Vacancy ({ id, worker, date }) {
  if (!(this instanceof Vacancy)) return new Vacancy(...arguments)
  id = id || shortid()
  this.toJSON = () => ({
    id,
    worker,
    date
  })

  getter(this, 'id', () => id)
  getter(this, 'worker', () => worker)
  getter(this, 'date', () => date)
}

function getter (that, property, get) {
  Object.defineProperty(that, property, {
    get
  })
}

Vacancy.forWorker = (worker) => {
  return new Vacancy({ worker })
}

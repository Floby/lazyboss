const got = require('got')
const querystring = require('querystring')

module.exports = BusyWorker

function BusyWorker ({ id, boss }) {
  if (!(this instanceof BusyWorker)) return new BusyWorker(...arguments)
  const client = got.extend({
    json: true,
    baseUrl: boss,
    headers: {
      authorization: `Plain ${querystring.encode({ id })}`
    }
  })

  this.apply = async (executor) => {
    const { headers, body: attempt } = await client.post('/jobs/attempt')
    const resultLocation = headers.location + '/result'
    const failureLocation = headers.location + '/failure'
    try {
      const result = await executor()
      await client.put(resultLocation, { body: result })
    } catch (error) {
      const reason = serializeError(error)
      await client.put(failureLocation, { body: reason })
    }
  }
}

function serializeError (error) {
  return {
    message: error.message
  }
}

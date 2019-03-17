const { NoJobForWorkerError } = require('../domain/errors')
const Boom = require('boom')
const querystring = require('querystring')

module.exports = routes

function routes (usecases) {
  return [{
    method: 'POST',
    path: '/jobs/attempt',
    handler: async (request, h) => {
      try {
        const workerCredentials = getWorkerCredentials(request)
        const attempt = await usecases.askForAttempt(workerCredentials)
        const body = attempt.toJSON()
        delete body.job.assignee
        return h.response(body)
          .code(201)
          .location(`/jobs/${attempt.job.id}/attempts/${attempt.id}`)
      } catch (error) {
        if (error instanceof NoJobForWorkerError) {
          return h.response({
            status: 'No Content',
            message: error.message,
          }).code(204)
        }
        throw error
      }
    }
  }]
}

function getWorkerCredentials (request) {
  const { authorization } = request.headers
  if (!authorization || !/^Plain /i.test(authorization)) {
    throw Boom.unauthorized('You MUST provide querystring encoded authorization', 'Plain')
  }
  const workerCredentials = querystring.parse(authorization.replace(/^plain ?/i, ''))
  if (!workerCredentials.id) {
    throw Boom.unauthorized('You MUST provide a worker id', 'Plain')
  }
  return workerCredentials
}

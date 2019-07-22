const { UnknownAttemptError, WrongWorkerError, NoJobForWorkerError, AttemptAlreadyFinishedError } = require('../domain/errors')
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
  }, {
    method: 'PUT',
    path: '/jobs/{jobId}/attempts/{attemptId}/result',
    handler: async (request, h) => {
      const { jobId, attemptId } = request.params
      const result = request.payload
      try {
        const workerCredentials = getWorkerCredentials(request)
        await usecases.completeAttempt(jobId, attemptId, workerCredentials, result)
        return h.response().code(201)
      } catch (error) {
        if (error instanceof UnknownAttemptError) {
          return Boom.notFound(error.message)
        }
        if (error instanceof AttemptAlreadyFinishedError) {
          return Boom.conflict(error.message)
        }
        if (error instanceof WrongWorkerError) {
          return Boom.forbidden(error.message)
        }
        throw error
      }
    }
  }, {
    method: 'PUT',
    path: '/jobs/{jobId}/attempts/{attemptId}/failure',
    handler: async (request, h) => {
      const { jobId, attemptId } = request.params
      const reason = request.payload
      try {
      const workerCredentials = getWorkerCredentials(request)
      await usecases.failAttempt(jobId, attemptId, workerCredentials, reason)
      } catch (error) {
        if (error instanceof UnknownAttemptError) {
          return Boom.notFound(error.message)
        }
        if (error instanceof AttemptAlreadyFinishedError) {
          return Boom.conflict(error.message)
        }
        if (error instanceof WrongWorkerError) {
          return Boom.forbidden(error.message)
        }
        throw error
      }
      return h.response().code(201)
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

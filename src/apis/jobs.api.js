const Boom = require('boom')
const Joi = require('joi')
const { UnknownJobError } = require('../domain/errors')

module.exports = routes

function routes (usecases) {
  return [{
    method: 'POST',
    path: '/jobs',
    handler: async (request, h) => {
      const jobId = await usecases.createJob({})
      return h.response()
        .code(202)
        .location(`/jobs/${jobId}`)
    }
  }, {
    method: 'GET',
    path: '/jobs/{jobId}',
    options: {
      validate: {
        params: {
          jobId: Joi.string().uuid()
        }
      }
    },
    handler: async (request, h) => {
      try {
        const job = await usecases.getJob(request.params.jobId)
        return job
      } catch (error) {
        if (error instanceof UnknownJobError) {
          return Boom.notFound(error.message)
        }
        throw error
      }
    }
  }]
}

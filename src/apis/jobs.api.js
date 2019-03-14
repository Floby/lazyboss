const Boom = require('boom')
const Joi = require('joi')
const { UnknownJobError } = require('../domain/errors')

module.exports = routes

function routes (usecases) {
  return [{
    method: 'POST',
    path: '/jobs',
    options: {
      validate: {
        payload: {
          type: Joi
            .string()
            .hostname()
            .required()
            .description('The type of job to create'),
          parameters: Joi
            .object()
            .optional()
            .description('The parameters of the job')
            .default({})
        },
        options: {
          stripUnknown: true
        }
      }
    },
    handler: async (request, h) => {
      const job = await usecases.createJob(request.payload)
      return h.response()
        .code(202)
        .location(`/jobs/${job.id}`)
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

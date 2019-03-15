const Hapi = require('hapi')
const jobRoutes = require('./src/apis/jobs.api')
const attemptRoutes = require('./src/apis/attempts.api')
const Container = require('./src/container')

exports.createServer = createServer
exports.createContainer = Container

async function createServer (config, usecases) {
  const server = new Hapi.Server({
    port: config.get('PORT')
  })
  server.route({
    method: 'GET',
    path: '/',
    handler () {
      return 'OK'
    }
  })
  server.route(jobRoutes(usecases))
  server.route(attemptRoutes(usecases))
  return server
}


const Hapi = require('hapi')

exports.createServer = createServer

async function createServer (config) {
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
  return server
}

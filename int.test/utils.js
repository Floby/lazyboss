const supertest = require('supertest')
const ms = require('ms')
const { createContainer, createServer } = require('../')

exports.createTestServer = async function createTestServer () {
  const config = new Map(Object.entries({
    PORT: 1998,
    LONG_POLLING_TIMEOUT: ms('10 seconds')
  }))
  const { usecases } = createContainer(config)
  const server = await createServer(config, usecases)
  const url = 'http://localhost:1998'
  const api = () => supertest(url)
  server.api = api
  server.url = url
  return server
}


exports.headerTrap = function headerTrap (headerName) {
  headerName = headerName.toLowerCase()
  function trap (res) {
    const value = res.headers[headerName]
    trap.value = () => value
  }
  trap.value = () => { throw Error('Trap not activated') }
  return trap
}

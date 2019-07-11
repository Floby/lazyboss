const { expect } = require('chai')
const querystring = require('querystring')
const ms = require('ms')
const delay = require('delay')
const supertest = require('supertest')
const { createContainer, createServer } = require('../')

describe('With one API running', () => {
  let server
  beforeEach(async () => {
    server = await createTestServer()
    await server.start()
  })
  afterEach(() => server.stop())

  context('When worker asks to attempt a job', () => {
    const workerCredentials = {
      id: 'test-worker'
    }
    let attemptRequest, attemptLocationTrap
    beforeEach('Ask attempt', () => {
      attemptLocationTrap = headerTrap('Location')
      attemptRequest = server.api()
        .post('/jobs/attempt')
        .set('Authorization', `Plain ${querystring.encode(workerCredentials)}`)
        .expect(201)
        .expect(attemptLocationTrap)
    })

    context('And a job is created', () => {
      const jobSpec = {
        type: 'test',
        parameters: { some: 'test' }
      }
      let jobId, jobLocationTrap
      beforeEach('Create Job', async () => {
        jobLocationTrap = headerTrap('Location')
        const { body } = await server.api()
          .post('/jobs')
          .send(jobSpec)
          .expect(202)
          .expect(jobLocationTrap)
        jobId = body.id
      })

      it('Attempt can be fulfilled', async () => {
        const expectedResult = { answer: 42 }
        const { body: attempt } = await attemptRequest
        const jobLocation = jobLocationTrap.value()
        const attemptLocation = attemptLocationTrap.value()

        await server.api()
          .get(jobLocation)
          .expect((res) => expect(res.body).to.have.property('status').equal('assigned'))

        await server.api()
          .put(`${attemptLocation}/result`)
          .set('Authorization', `Plain ${querystring.encode(workerCredentials)}`)
          .send(expectedResult)
          .expect(201)

        await server.api()
          .get(jobLocation)
          .expect((res) => expect(res.body).to.have.property('status').equal('done'))
          .expect((res) => expect(res.body).to.have.property('result').deep.equal(expectedResult))

      })
    })
  })
})


async function createTestServer () {
  const config = new Map(Object.entries({
    PORT: 1998,
    LONG_POLLING_TIMEOUT: ms('10 seconds')
  }))
  const { usecases } = createContainer(config)
  const server = await createServer(config, usecases)
  const api = () => supertest('http://localhost:1998')
  server.api = api
  return server
}


function headerTrap (headerName) {
  headerName = headerName.toLowerCase()
  function trap (res) {
    const value = res.headers[headerName]
    trap.value = () => value
  }
  trap.value = () => { throw Error('Trap not activated') }
  return trap
}

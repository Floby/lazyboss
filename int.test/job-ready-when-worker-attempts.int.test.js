const { expect } = require('chai')
const querystring = require('querystring')
const { createTestServer, headerTrap } = require('./utils')

describe('With one API running', () => {
  let server
  beforeEach(async () => {
    server = await createTestServer()
    await server.start()
  })
  afterEach(() => server.stop())

  context('When a job is created', () => {
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

    context('And a worker attempts', () => {
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


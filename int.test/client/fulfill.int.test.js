const { expect } = require('chai')
const delay = require('delay')
const { createTestServer, headerTrap } = require('../utils')
const BusyWorker = require('../../src/client/busy-worker')

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

    context('and client applies', () => {
      let worker
      beforeEach(() => {
        worker = BusyWorker({
          id: 'my-worker',
          boss: server.url
        })
      })
      it('fulfills the job', async () => {
        const expectedResult = {
          some: 'expected',
          value: 8
        }
        const executor = () => {
          return delay(200).then(() => expectedResult)
        }
        await worker.apply(executor)

        await server.api()
          .get(jobLocationTrap.value())
          .expect((res) => expect(res.body).to.have.property('status').equal('done'))
          .expect((res) => expect(res.body).to.have.property('result').deep.equal(expectedResult))
      })
      it('fails the job', async () => {
        const expectedReason = {
          message: 'oooooooops'
        }
        const executor = async () => {
          await delay(200)
          throw Error(expectedReason.message)
        }
        await worker.apply(executor)

        await server.api()
          .get(jobLocationTrap.value())
          .expect((res) => expect(res.body).to.have.property('status').equal('failed'))
          .expect((res) => expect(res.body).to.have.property('failure').deep.equal(expectedReason))
      })
    })
  })
})



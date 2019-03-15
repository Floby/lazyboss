const uuid = require('uuid/v4')
const querystring = require('querystring')
const clone = require('clone-deep')
const shortid = require('shortid')
const Attempt = require('../src/domain/attempt')
const Job = require('../src/domain/job')
const { expect, describeWithApi, sinon } = require('./utils')
const { NoJobForWorkerError } = require('../src/domain/errors')

describeWithApi((api, usecases) => {
  describe('POST /jobs/attempt', () => {
    const workerId = 'some-worker-id-' + shortid()
    const expectedWorkerCredentials = { id: workerId }
    const plainAuthorizationHeader = `Plain ${querystring.encode(expectedWorkerCredentials)}`
    const expectedId = shortid()
    const pendingJobId = uuid()
    const expectedAttempt = Attempt({
      id: expectedId,
      worker: expectedWorkerCredentials,
      job: Job({ id: pendingJobId, type: 'some-job' })
    })
    beforeEach(() => {
      usecases.askForAttempt = sinon.stub().resolves()
    })
    beforeEach(() => {
      usecases.askForAttempt.resolves(expectedAttempt)
    })
    it('replies 201', () => {
      return api()
        .post('/jobs/attempt')
        .set('Authorization', plainAuthorizationHeader)
        .expect(201)
    })
    it('calls usecase askForAttempt(workerCredentials)', async () => {
      // When
      await api()
        .post('/jobs/attempt')
        .set('Authorization', plainAuthorizationHeader)
      // Then
      expect(usecases.askForAttempt).to.have.been.calledWith(expectedWorkerCredentials)
    })
    it('replies with a location headers', () => {
      return api()
        .post('/jobs/attempt')
        .set('Authorization', plainAuthorizationHeader)
        .expect('Location', `/jobs/${pendingJobId}/attempts/${expectedId}`)
    })
    it('replies with attempt as payload', () => {
      return api()
        .post('/jobs/attempt')
        .set('Authorization', plainAuthorizationHeader)
        .expect(expectedAttempt.toJSON())
    })
    context('when usecase times out', () => {
      beforeEach(() => usecases.askForAttempt.rejects(new NoJobForWorkerError('')))
      it('replies 204', () => {
        return api()
          .post('/jobs/attempt')
          .set('Authorization', plainAuthorizationHeader)
          .expect(204)
      })
    })
    context('When using no credentials for worker', () => {
      it('replies 401', () => {
        return api()
          .post('/jobs/attempt')
          .expect(401)
      })
    })
    context('When using credentials for worker without an id', () => {
      const plainAuthorizationHeader = `Plain ${querystring.encode({hello: 'world'})}`
      it('replies 401', () => {
        return api()
          .post('/jobs/attempt')
          .set('Authorization', plainAuthorizationHeader)
          .expect(401)
      })
    })
  })
})


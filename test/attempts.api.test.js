const uuid = require('uuid/v4')
const querystring = require('querystring')
const clone = require('clone-deep')
const shortid = require('shortid')
const Attempt = require('../src/domain/attempt')
const Job = require('../src/domain/job')
const { expect, describeWithApi, sinon } = require('./utils')
const { UnknownAttemptError, WrongWorkerError, NoJobForWorkerError, AttemptAlreadyFinishedError } = require('../src/domain/errors')

describeWithApi((api, usecases) => {
  const workerId = 'some-worker-id-' + shortid()
  const expectedWorkerCredentials = { id: workerId }
  const plainAuthorizationHeader = `Plain ${querystring.encode(expectedWorkerCredentials)}`
  describe('POST /jobs/attempt', () => {
    const expectedId = shortid()
    const pendingJobId = uuid()
    const expectedAttempt = Attempt({
      id: expectedId,
      worker: expectedWorkerCredentials,
      job: Job({ id: pendingJobId, status: 'assigned', type: 'some-job', assignee: expectedWorkerCredentials })
    })
    beforeEach(() => {
      usecases.askForAttempt = sinon.stub().resolves()
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
      const expectedPayload = expectedAttempt.toJSON()
      delete expectedPayload.job.assignee
      return api()
        .post('/jobs/attempt')
        .set('Authorization', plainAuthorizationHeader)
        .expect(expectedPayload)
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
  describe('PUT /jobs/{jobId}/attempts/{attemptId}/result', () => {
    const jobId = uuid()
    const attemptId = shortid()
    const result = { some: { processing: 'result' } }
    beforeEach(() => {
      usecases.completeAttempt = sinon.stub().resolves()
    })
    it('replies 201', () => {
      return api().put(`/jobs/${jobId}/attempts/${attemptId}/result`)
        .set('Authorization', plainAuthorizationHeader)
        .send(result)
        .expect(201)
    })
    it('calls usecase completeAttempt()', async () => {
      await api().put(`/jobs/${jobId}/attempts/${attemptId}/result`)
        .set('Authorization', plainAuthorizationHeader)
        .send(result)
      expect(usecases.completeAttempt).to.have.been.calledWith(jobId, attemptId, expectedWorkerCredentials, result)
    })
    context('with unknown attempt', () => {
      beforeEach(() => usecases.completeAttempt.rejects(new UnknownAttemptError(attemptId)))
      it('replies with a 404', async () => {
        await api().put(`/jobs/${jobId}/attempts/${attemptId}/result`)
          .set('Authorization', plainAuthorizationHeader)
          .send(result)
          .expect(404)
      })
    })
    context('when usecases rejects with AttemptAlreadyFinishedError', () => {
      beforeEach(() => usecases.completeAttempt.rejects(new AttemptAlreadyFinishedError('', '')))
      it('replies with a 409', async () => {
        await api().put(`/jobs/${jobId}/attempts/${attemptId}/result`)
          .set('Authorization', plainAuthorizationHeader)
          .send(result)
          .expect(409)
      })
    })
    context('when usecases rejects with a general error', () => {
      beforeEach(() => usecases.completeAttempt.rejects(new Error('hey')))
      it('replies with a 500', async () => {
        await api().put(`/jobs/${jobId}/attempts/${attemptId}/result`)
          .set('Authorization', plainAuthorizationHeader)
          .send(result)
          .expect(500)
      })
    })
    context('When using no credentials for worker', () => {
      it('replies 401', () => {
        return api().put(`/jobs/${jobId}/attempts/${attemptId}/result`)
          .send(result)
          .expect(401)
      })
    })
    context('when using credentials for another worker', () => {
      const otherWorkerCredentials = `Plain id=some-other-worker`
      beforeEach(() => usecases.completeAttempt.rejects(new WrongWorkerError({ id: 'some-other-worker' }, expectedWorkerCredentials)))
      it('replies 403', () => {
        return api().put(`/jobs/${jobId}/attempts/${attemptId}/result`)
          .set('Authorization', otherWorkerCredentials)
          .send(result)
          .expect(403)
      })
    })
  })
  describe('PUT /jobs/{jobId}/attempts/{attemptId}/failure', () => {
    const jobId = uuid()
    const attemptId = shortid()
    const reason = { some: { reason: 'explanation' } }
    beforeEach(() => {
      usecases.failAttempt = sinon.stub().resolves()
    })
    it('replies 201', () => {
      return api().put(`/jobs/${jobId}/attempts/${attemptId}/failure`)
        .set('Authorization', plainAuthorizationHeader)
        .send(reason)
        .expect(201)
    })
    it('calls usecase failAttempt()', async () => {
      await api().put(`/jobs/${jobId}/attempts/${attemptId}/failure`)
        .set('Authorization', plainAuthorizationHeader)
        .send(reason)
      expect(usecases.failAttempt).to.have.been.calledWith(jobId, attemptId, expectedWorkerCredentials, reason)
    })
    context('with unknown attempt', () => {
      beforeEach(() => usecases.failAttempt.rejects(new UnknownAttemptError(attemptId)))
      it('replies with a 404', async () => {
        await api().put(`/jobs/${jobId}/attempts/${attemptId}/failure`)
          .set('Authorization', plainAuthorizationHeader)
          .send(reason)
          .expect(404)
      })
    })
    context('when usecases rejects with AttemptAlreadyFinishedError', () => {
      beforeEach(() => usecases.failAttempt.rejects(new AttemptAlreadyFinishedError('', '')))
      it('replies with a 409', async () => {
        await api().put(`/jobs/${jobId}/attempts/${attemptId}/failure`)
          .set('Authorization', plainAuthorizationHeader)
          .send(reason)
          .expect(409)
      })
    })
    context('when usecases rejects with a general error', () => {
      beforeEach(() => usecases.failAttempt.rejects(new Error('hey')))
      it('replies with a 500', async () => {
        await api().put(`/jobs/${jobId}/attempts/${attemptId}/failure`)
          .set('Authorization', plainAuthorizationHeader)
          .send(reason)
          .expect(500)
      })
    })
    context('When using no credentials for worker', () => {
      it('replies 401', () => {
        return api().put(`/jobs/${jobId}/attempts/${attemptId}/failure`)
          .send(reason)
          .expect(401)
      })
    })
    context('when using credentials for another worker', () => {
      const otherWorkerCredentials = `Plain id=some-other-worker`
      beforeEach(() => usecases.failAttempt.rejects(new WrongWorkerError({ id: 'some-other-worker' }, expectedWorkerCredentials)))
      it('replies 403', () => {
        return api().put(`/jobs/${jobId}/attempts/${attemptId}/failure`)
          .set('Authorization', otherWorkerCredentials)
          .send(reason)
          .expect(403)
      })
    })
  })
})


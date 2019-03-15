const uuid = require('uuid/v4')
const { expect, sinon, matchUuid } = require('./utils')
const AskForAttempt = require('../src/usecases/ask-for-attempt.usecase')
const { NoJobForWorkerError } = require('../src/domain/errors')

describe('AskForAttempt(JobsRepository, AttemptsRepository, timeout)', () => {
  const timeout = 200
  let askForAttempt, jobsRepositoryStub, attemptsRepositoryStub
  beforeEach(() => {
    jobsRepositoryStub = {
      get: sinon.stub(),
      observePending: sinon.stub()
    }
    attemptsRepositoryStub = {
      save: sinon.stub()
    }
    askForAttempt = AskForAttempt(jobsRepositoryStub, attemptsRepositoryStub, timeout)
  })
  describe('(workerCredentials)', () => {
    const workerCredentials = { id: 'some-id' }
    const worker = {
      id: workerCredentials.id
    }
    const job = {
      id: uuid(),
      type: 'some-processing',
      parameters: { some: 'data' }
    }
    it('observes the next pending job', async () => {
      // Given
      jobsRepositoryStub.observePending.resolves(job)
      // When
      await askForAttempt(workerCredentials)
      // Then
      expect(jobsRepositoryStub.observePending).to.have.been.calledOnce
    })
    context('when a jobs becomes pending', () => {
      const expectedAttempt = {
        id: matchUuid(),
        worker,
        job
      }
      beforeEach(() => {
        jobsRepositoryStub.observePending.resolves(job)
      })
      it('stores a new attempt assigned to the worker', async () => {
        // When
        await askForAttempt(workerCredentials)
        // Then
        expect(attemptsRepositoryStub.save).to.have.been.calledWith(expectedAttempt)
      })
      it('resolves the saved attempt', async () => {
        // When
        const actual = await askForAttempt(workerCredentials)
        // Then
        const savedAttempt = attemptsRepositoryStub.save.firstCall.args[0]
        expect(actual).to.deep.equal(savedAttempt)
      })
    })
    context('when no job becomes pending', () => {
      beforeEach(() => {
        const neverResolves = new Promise(() => {})
        jobsRepositoryStub.observePending.returns(neverResolves)
      })
      it('rejects with NoJobForWorkerError', async function () {
        this.timeout(timeout + 10)
        try {
          await askForAttempt(workerCredentials)
          expect.fail('Failure')
        } catch (error) {
          expect(error).to.be.and.instanceOf(NoJobForWorkerError)
        }
      })
    })
  })
})

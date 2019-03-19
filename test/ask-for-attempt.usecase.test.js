const uuid = require('uuid/v4')
const { expect, sinon, matchUuid } = require('./utils')
const AskForAttempt = require('../src/usecases/ask-for-attempt.usecase')
const { NoJobForWorkerError } = require('../src/domain/errors')
const Job = require('../src/domain/job')
const Attempt = require('../src/domain/attempt')

describe('USECASE AskForAttempt(JobsRepository, AttemptsRepository, timeout)', () => {
  const timeout = 200
  let askForAttempt, jobsRepositoryStub, attemptsRepositoryStub
  beforeEach(() => {
    jobsRepositoryStub = {
      get: sinon.stub(),
      save: sinon.stub().resolves(),
      listPending: sinon.stub().resolves([]),
      observePending: sinon.stub().resolves(never())
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
    let job
    beforeEach(() => {
      job = new Job({
        type: 'some-processing',
        paramters: { some: 'data' }
      })
      sinon.spy(job, 'assign')
    })
    context('When at least one job is pending', () => {
      let firstPendingJob, secondPendingJob
      beforeEach(() => {
        firstPendingJob = job
        secondPendingJob = new Job({})
        jobsRepositoryStub.listPending.resolves([firstPendingJob, secondPendingJob])
      })
      it('assigns the worker to the first pending job', async () => {
        // When
        await askForAttempt(workerCredentials)
        // Then
        expect(firstPendingJob.assign).to.have.been.calledOnce
        expect(firstPendingJob.assign).to.have.been.calledWith(workerCredentials)
      })
      it('stores a new attempt assigned to the worker', async () => {
        // When
        await askForAttempt(workerCredentials)
        // Then
        const expectedAttempt = firstPendingJob.assign.firstCall.returnValue
        expect(attemptsRepositoryStub.save).to.have.been.calledWith(expectedAttempt)
      })
      it('resolves the saved attempt', async () => {
        // When
        const actual = await askForAttempt(workerCredentials)
        // Then
        const savedAttempt = attemptsRepositoryStub.save.firstCall.args[0]
        expect(actual).to.deep.equal(savedAttempt)
      })
      it('saves the updated job', async () => {
        // When
        await askForAttempt(workerCredentials)
        // Then
        expect(jobsRepositoryStub.save).to.have.been.calledWith(job)
      })
    })
    context('When no job is pending', () => {
      it('observes the next pending job', async () => {
        // Given
        jobsRepositoryStub.observePending.resolves(job)
        // When
        await askForAttempt(workerCredentials)
        // Then
        expect(jobsRepositoryStub.observePending).to.have.been.calledOnce
      })
      context('and a jobs becomes pending', () => {
        const expectedAttempt = {
          id: matchUuid(),
          worker,
          job
        }
        beforeEach(() => {
          jobsRepositoryStub.observePending.resolves(job)
        })
        it('assigns the worker to the job', async () => {
          // When
          await askForAttempt(workerCredentials)
          // Then
          expect(job.assign).to.have.been.calledWith(worker)
          expect(job.assign).to.have.been.calledOnce
        })
        it('stores a new attempt assigned to the worker', async () => {
          // When
          await askForAttempt(workerCredentials)
          // Then
          const expectedAttempt = job.assign.firstCall.returnValue
          expect(attemptsRepositoryStub.save).to.have.been.calledWith(expectedAttempt)
        })
        it('resolves the saved attempt', async () => {
          // When
          const actual = await askForAttempt(workerCredentials)
          // Then
          const savedAttempt = attemptsRepositoryStub.save.firstCall.args[0]
          expect(actual).to.deep.equal(savedAttempt)
        })
        it('saves the updated job', async () => {
          // When
          await askForAttempt(workerCredentials)
          // Then
          expect(jobsRepositoryStub.save).to.have.been.calledWith(job)
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
})

function never () {
  return new Promise(() => {})
}

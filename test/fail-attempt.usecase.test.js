const uuid = require('uuid/v4')
const shortid = require('shortid')
const { expect, sinon } = require('./utils')
const { WrongWorkerError, UnknownAttemptError } = require('../src/domain/errors')
const Job = require('../src/domain/job')
const Attempt = require('../src/domain/attempt')
const FailAttempt = require('../src/usecases/fail-attempt.usecase')

describe('USECASE FailAttempt(jobsRepository, attemptsRepository, assignmentsRepository)', () => {
  let failAttempt
  let jobsRepositoryStub, attemptsRepositoryStub, assignmentsRepositoryStub
  const reason = { message: 'something went aspook' }
  const worker = { id: 'some-worker' }
  let job, attempt, jobId, attemptId
  beforeEach(() => {
    job = Job({})
    attempt = job.assign(worker)
    jobId = job.id
    attemptId = attempt.id
  })
  beforeEach(() => {
    sinon.spy(job, 'complete')
    sinon.spy(attempt, 'fail')
    jobsRepositoryStub = {
      get: sinon.stub(),
      save: sinon.stub().resolves(),
      listPending: sinon.stub().resolves([]),
    }
    attemptsRepositoryStub = {
      get: sinon.stub().resolves(attempt),
      save: sinon.stub()
    }
    assignmentsRepositoryStub = {
      unset: sinon.stub().resolves()
    }
    failAttempt = FailAttempt(jobsRepositoryStub, attemptsRepositoryStub, assignmentsRepositoryStub)
  })
  describe('(jobId, attemptId, worker, reason)', () => {
    it('finds the corresponding attempt', async () => {
      // When
      await failAttempt(jobId, attemptId, worker, reason)
      // Then
      expect(attemptsRepositoryStub.get).to.have.been.calledWith(attemptId)
    })

    it('calls attempt.fail(reason)', async () => {
      // When
      await failAttempt(jobId, attemptId, worker, reason)
      // Then
      expect(attempt.fail).to.have.been.calledWith(reason)
    })

    it('saves the attempt', async () => {
      // When
      await failAttempt(jobId, attemptId, worker, reason)
      // Then
      expect(attemptsRepositoryStub.save).to.have.been.calledWith(attempt)
      expect(attemptsRepositoryStub.save).to.have.been.calledAfter(attempt.fail)
    })
    it('saves the job', async () => {
      // When
      await failAttempt(jobId, attemptId, worker, reason)
      // Then
      expect(jobsRepositoryStub.save).to.have.been.calledWith(job)
      expect(jobsRepositoryStub.save).to.have.been.calledAfter(attempt.fail)
    })
    it('removes the assignment', async () => {
      // Whe
      await failAttempt(jobId, attemptId, worker, reason)
      // Then
      expect(assignmentsRepositoryStub.unset).to.have.been.calledWith({ jobId, attemptId })
    })

    context('When the worker is different from the one assigned', () => {
      const worker = { id: 'some-other-worker' }
      it('throws a DifferentWorkerError', async () => {
        await expect(failAttempt(jobId, attemptId, worker, reason))
          .to.eventually.be.rejectedWith(WrongWorkerError)
      })
      it('does not save anything', async () => {
        try {
          await failAttempt(jobId, attemptId, worker, reason)
        } catch (error) {}
        expect(attemptsRepositoryStub.save).not.to.have.been.called
        expect(jobsRepositoryStub.save).not.to.have.been.called
      })
    })

    context('when no attempt is found', () => {
      beforeEach(() => attemptsRepositoryStub.get.resolves(undefined))
      it('rejects an UnknownAttemptError', async () => {
        await expect(failAttempt(jobId, attemptId, worker, reason))
          .to.eventually.be.rejectedWith(UnknownAttemptError)
      })
    })
    context('when attempt is for another job', () => {
      const otherAttempt = Attempt({job: Job({})})
      beforeEach(() => attemptsRepositoryStub.get.resolves(otherAttempt))
      it('rejects an UnknownAttemptError', async () => {
        await expect(failAttempt(jobId, attemptId, worker, reason))
          .to.eventually.be.rejectedWith(UnknownAttemptError)
      })
      it('does not save anything', async () => {
        try {
          await failAttempt(jobId, attemptId, worker, reason)
        } catch (error) {}
        expect(attemptsRepositoryStub.save).not.to.have.been.called
        expect(jobsRepositoryStub.save).not.to.have.been.called
      })
    })
  })
})

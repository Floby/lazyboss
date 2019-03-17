const uuid = require('uuid/v4')
const shortid = require('shortid')
const { expect, sinon } = require('./utils')
const { WrongWorkerError, UnknownAttemptError } = require('../src/domain/errors')
const Job = require('../src/domain/job')
const Attempt = require('../src/domain/attempt')
const CompleteAttempt = require('../src/usecases/complete-attempt.usecase')

describe('CompleteAttempt(jobsRepository, attemptsRepository)', () => {
  const result = { some: { resulting: 'value' } }
  const worker = { id: 'some-worker' }
  let job, attempt, jobId, attemptId
  let completeAttempt, jobsRepositoryStub, attemptsRepositoryStub
  beforeEach(() => {
    job = Job({})
    attempt = job.assign(worker)
    jobId = job.id
    attemptId = attempt.id
  })
  beforeEach(() => {
    sinon.spy(job, 'complete')
    sinon.spy(attempt, 'finish')
    jobsRepositoryStub = {
      get: sinon.stub(),
      save: sinon.stub().resolves(),
      listPending: sinon.stub().resolves([]),
    }
    attemptsRepositoryStub = {
      get: sinon.stub().resolves(attempt),
      save: sinon.stub()
    }
    completeAttempt = CompleteAttempt(jobsRepositoryStub, attemptsRepositoryStub)
  })
  describe('(jobId, attemptId, worker, result)', () => {
    it('finds the corresponding attempt', async () => {
      // When
      await completeAttempt(jobId, attemptId, worker, result)
      // Then
      expect(attemptsRepositoryStub.get).to.have.been.calledWith(attemptId)
    })

    it('calls attempt.finish(result)', async () => {
      // When
      await completeAttempt(jobId, attemptId, worker, result)
      // Then
      expect(attempt.finish).to.have.been.calledWith(result)
    })

    it('saves the attempt', async () => {
      // When
      await completeAttempt(jobId, attemptId, worker, result)
      // Then
      expect(attemptsRepositoryStub.save).to.have.been.calledWith(attempt)
      expect(attemptsRepositoryStub.save).to.have.been.calledAfter(attempt.finish)
    })
    it('saves the job', async () => {
      // When
      await completeAttempt(jobId, attemptId, worker, result)
      // Then
      expect(jobsRepositoryStub.save).to.have.been.calledWith(job)
      expect(jobsRepositoryStub.save).to.have.been.calledAfter(attempt.finish)
    })

    context('When the worker is different from the one assigned', () => {
      const worker = { id: 'some-other-worker' }
      it('throws a DifferentWorkerError', async () => {
        await expect(completeAttempt(jobId, attemptId, worker, result))
          .to.eventually.be.rejectedWith(WrongWorkerError)
      })
      it('does not save anything', async () => {
        try {
          await completeAttempt(jobId, attemptId, worker, result)
        } catch (error) {}
        expect(attemptsRepositoryStub.save).not.to.have.been.called
        expect(jobsRepositoryStub.save).not.to.have.been.called
      })
    })

    context('when no attempt is found', () => {
      beforeEach(() => attemptsRepositoryStub.get.resolves(undefined))
      it('rejects an UnknownAttemptError', async () => {
        await expect(completeAttempt(jobId, attemptId, worker, result))
          .to.eventually.be.rejectedWith(UnknownAttemptError)
      })
    })
    context('when attempt is for another job', () => {
      const otherAttempt = Attempt({job: Job({})})
      beforeEach(() => attemptsRepositoryStub.get.resolves(otherAttempt))
      it('rejects an UnknownAttemptError', async () => {
        await expect(completeAttempt(jobId, attemptId, worker, result))
          .to.eventually.be.rejectedWith(UnknownAttemptError)
      })
      it('does not save anything', async () => {
        try {
          await completeAttempt(jobId, attemptId, worker, result)
        } catch (error) {}
        expect(attemptsRepositoryStub.save).not.to.have.been.called
        expect(jobsRepositoryStub.save).not.to.have.been.called
      })
    })
  })
})


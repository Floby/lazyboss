const uuid = require('uuid/v4')
const delay = require('delay')
const { expect, sinon, matchUuid } = require('./utils')
const AskForAttempt = require('../src/usecases/ask-for-attempt.usecase')
const { NoJobForWorkerError } = require('../src/domain/errors')
const Job = require('../src/domain/job')
const Attempt = require('../src/domain/attempt')
const Vacancy = require('../src/domain/vacancy')

describe('USECASE AskForAttempt(JobsRepository, AssignmentService, JobAnnouncer, timeout)', () => {
  const timeout = 200
  let askForAttempt, jobsRepositoryStub, assignmentServiceStub, jobAnnouncerStub
  beforeEach(() => {
    jobsRepositoryStub = {
      get: sinon.stub(),
      save: sinon.stub().resolves(),
      listPending: sinon.stub().resolves([]),
      observePending: sinon.stub().resolves(never())
    }
    assignmentServiceStub = {
      assignVacancyToJob: sinon.stub().resolves()
    }
    jobAnnouncerStub = {
      awaitJobs: sinon.stub(() => new Promise(() => null))
    }
    sinon.stub(Vacancy, 'forWorker')
    askForAttempt = AskForAttempt(jobsRepositoryStub, assignmentServiceStub, jobAnnouncerStub, timeout)
  })
  afterEach(() => {
    Vacancy.forWorker.restore()
  })
  describe('(workerCredentials)', () => {
    const workerCredentials = { id: 'some-id' }
    const worker = {
      id: workerCredentials.id
    }
    let createdAttempt
    let job
    beforeEach(() => {
      job = new Job({
        type: 'some-processing',
        paramters: { some: 'data' }
      })
      createdAttempt = Attempt({ worker, job })
      assignmentServiceStub.assignVacancyToJob.resolves(createdAttempt)
    })
    context('When at least one job is pending', () => {
      let firstPendingJob, secondPendingJob
      beforeEach(() => {
        firstPendingJob = job
        secondPendingJob = new Job({})
        jobsRepositoryStub.listPending.resolves([firstPendingJob, secondPendingJob])
      })
      it('lists pending jobs', async () => {
        // When
        await askForAttempt(workerCredentials)
        // Then
        expect(jobsRepositoryStub.listPending).to.have.been.calledOnce
      })
      it('assigns the worker\'s vacancy to the first pending job', async () => {
        // Given
        const vacancy = { some: 'vacancy' }
        Vacancy.forWorker.withArgs(workerCredentials).returns(vacancy)
        // When
        await askForAttempt(workerCredentials)
        // Then
        expect(assignmentServiceStub.assignVacancyToJob).to.have.been.calledWith(vacancy, job)
      })
      it('resolves the created attempt', async () => {
        // When
        const actual = await askForAttempt(workerCredentials)
        // Then
        expect(actual).to.deep.equal(createdAttempt)
      })
      it('saves the updated job', async () => {
        // When
        await askForAttempt(workerCredentials)
        // Then
        expect(jobsRepositoryStub.save).to.have.been.calledAfter(assignmentServiceStub.assignVacancyToJob)
        expect(jobsRepositoryStub.save).to.have.been.calledWith(job)
      })
    })
    context('When no job is pending', () => {
      it('observes the next pending jobs', async () => {
        // Given
        jobAnnouncerStub.awaitJobs = sinon.stub().callsFake(() => delay(50))
        // When
        await askForAttempt(workerCredentials).catch(() => true)
        // Then
        expect(jobAnnouncerStub.awaitJobs).to.have.been.called
      })
      context('and jobs become pending', () => {
        const expectedAttempt = {
          id: matchUuid(),
          worker,
          job
        }
        beforeEach(() => {
          jobAnnouncerStub.awaitJobs = sinon.stub().resolves()
          jobsRepositoryStub.listPending.onSecondCall().resolves([job])
        })
        it('lists pending jobs again', async () => {
          // When
          await askForAttempt(workerCredentials)
          // Then
          expect(jobsRepositoryStub.listPending).to.have.been.calledTwice
          expect(jobsRepositoryStub.listPending)
            .to.have.been.calledBefore(jobAnnouncerStub.awaitJobs)
          expect(jobsRepositoryStub.listPending)
            .to.have.been.calledAfter(jobAnnouncerStub.awaitJobs)
        })
        it('assigns the worker\'s vacancy to the first pending job', async () => {
          // Given
          const vacancy = { some: 'vacancy' }
          Vacancy.forWorker.withArgs(workerCredentials).returns(vacancy)
          // When
          await askForAttempt(workerCredentials)
          // Then
          expect(assignmentServiceStub.assignVacancyToJob).to.have.been.calledWith(vacancy, job)
        })
        it('resolves the created attempt', async () => {
          // When
          const actual = await askForAttempt(workerCredentials)
          // Then
          expect(actual).to.deep.equal(createdAttempt)
        })
        it('saves the updated job', async () => {
          // When
          await askForAttempt(workerCredentials)
          // Then
          expect(jobsRepositoryStub.save).to.have.been.calledAfter(assignmentServiceStub.assignVacancyToJob)
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

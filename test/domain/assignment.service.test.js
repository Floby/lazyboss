const Vacancy = require('../../src/domain/vacancy')
const Job = require('../../src/domain/job')
const AssignmentService = require('../../src/domain/assignment.service')
const { expect, sinon, trap } = require('../utils')

describe('AssignmentService(attemptsRepository, assignmentsRepository)', () => {
  let service
  let attemptsRepositoryStub, assignmentsRepositoryStub
  beforeEach(() => {
    attemptsRepositoryStub = {
      save: sinon.stub().resolves(),
      remove: sinon.stub().resolves()
    }
    assignmentsRepositoryStub = {
      set: sinon.stub().resolves()
    }
    service = new AssignmentService(attemptsRepositoryStub, assignmentsRepositoryStub)
  })
  describe('.assignVacancyToJob(vacancy, job)', () => {
    const worker = { id: 'some-worker' }
    let job, vacancy
    beforeEach(() => {
      vacancy = new Vacancy({ worker })
      job = new Job({ type: 'test' })
    })
    it('resolves an attempt', async () => {
      // When
      const actual = await service.assignVacancyToJob(vacancy, job)
      // Then
      expect(actual.toJSON()).excluding('id').to.deep.equal({
        worker: vacancy.worker,
        job: job.toJSON(),
        result: null, failure: null
      })
    })
    it('assigns the worker to the job', async () => {
      // Given
      sinon.spy(job, 'assign')
      // When
      await service.assignVacancyToJob(vacancy, job)
      // Then
      expect(job.assign).to.have.been.calledWith(worker)
    })
    it('saves an attempt', async () => {
      // When
      const attempt = await service.assignVacancyToJob(vacancy, job)
      // Then
      expect(attemptsRepositoryStub.save).to.have.been.calledWith(attempt)
    })
    it('creates an assignment', async () => {
      // When
      const attempt = await service.assignVacancyToJob(vacancy, job)
      // Then
      const expectedAssignment = { jobId: job.id, attemptId: attempt.id }
      expect(assignmentsRepositoryStub.set).to.have.been.calledWith(expectedAssignment)
    })
    context('When saving the assignment fails', () => {
      beforeEach(() => {
        assignmentsRepositoryStub.set.rejects(Error('Already assigned'))
      })
      it('resolves null', async () => {
        // When
        const actual = await service.assignVacancyToJob(vacancy, job)
        // Then
        expect(actual).to.equal(null)
      })
      it('removes the attempt', async () => {
        // Given
        const attempt = trap()
        attemptsRepositoryStub.save.withArgs(attempt.capture).resolves()
        // When
        await service.assignVacancyToJob(vacancy, job)
        // Then
        expect(attemptsRepositoryStub.remove).to.have.been.calledWith(attempt.value().id)
      })
    })
  })
})


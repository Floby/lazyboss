const Job = require('../src/domain/job')
const { expect, sinon, matchUuid, matchJSON, fail } = require('./utils')
const CreateJob = require('../src/usecases/create-job.usecase')

describe('USECASE CreateJob(JobsRepository)', () => {
  let jobsRepositoryStub, createJob
  beforeEach(() => {
    jobsRepositoryStub = {
      get: sinon.stub(), save: sinon.stub()
    }
    jobAnnouncerStub = {
      announceJobs: sinon.stub()
    }
    createJob = CreateJob(jobsRepositoryStub, jobAnnouncerStub)
  })
  describe('(jobCreationCommand)', () => {
    const jobCreationCommand = {
      type: 'process-stuff',
      parameters: {
        some: 'data'
      }
    }
    it('calls jobsRepository.save(job) with a new job', async () => {
      // When
      await createJob(jobCreationCommand)
      // Then
      expect(jobsRepositoryStub.save).to.have.been.calledWith(sinon.match.instanceOf(Job))
      const savedJob = jobsRepositoryStub.save.firstCall.args[0]
      expect(savedJob.toJSON()).to.deep.contain({
        type: jobCreationCommand.type,
        parameters: jobCreationCommand.parameters
      })
      expect(savedJob.toJSON()).to.have.property('id').to.match(matchUuid.regex)
    })
    it('announces jobs', async () => {
      // When
      await createJob(jobCreationCommand)
      // Then
      expect(jobAnnouncerStub.announceJobs).to.have.been.calledOnce
    })
    it('resolves with the created job', async () => {
      // When
      const actual = await createJob(jobCreationCommand)
      // Then
      const createdJob = jobsRepositoryStub.save.firstCall.args[0]
      expect(actual).to.deep.equal(createdJob)
    })
  })
})


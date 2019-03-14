const { expect, sinon } = require('./utils')
const CreateJob = require('../src/usecases/create-job.usecase')

describe('CreateJob(JobsRepository)', () => {
  let jobsRepositoryStub
  beforeEach(() => {
    jobsRepositoryStub = {
      get: sinon.stub(), save: sinon.stub()
    }
    createJob = CreateJob(jobsRepositoryStub)
  })
  describe('(jobCreationCommand)', () => {
    const jobCreationCommand = {
      type: 'process-stuff',
      parameters: {
        some: 'data'
      }
    }
    it('calls jobsRepository.save(job) with a generated id', async () => {
      // Given
      const expectedJob = {
        id: matchUuid(),
        type: jobCreationCommand.type,
        parameters: jobCreationCommand.parameters
      }
      // When
      await createJob(jobCreationCommand)
      // Then
      expect(jobsRepositoryStub.save).to.have.been.calledWith(expectedJob)
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

function fails () {
  throw Error ('FAILURE')
}

function matchUuid() {
  const regex = /[0-9a-f]{8}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{12}/i
  return sinon.match(regex)
}

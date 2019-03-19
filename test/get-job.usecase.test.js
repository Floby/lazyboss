const uuid = require('uuid/v4')
const { expect, sinon } = require('./utils')
const GetJob = require('../src/usecases/get-job.usecase')
const { UnknownJobError } = require('../src/domain/errors')

describe('USECASE GetJob(JobsRepository)', () => {
  let jobsRepositoryStub, getJob
  beforeEach(() => {
    jobsRepositoryStub = {
      get: sinon.stub(), save: sinon.stub()
    }
    getJob = GetJob(jobsRepositoryStub)
  })

  describe('(jobId)', () => {
    const jobId = uuid()
    const expectedJob = { id: jobId }
    beforeEach(() => {
      jobsRepositoryStub.get.withArgs(jobId).resolves(expectedJob)
    })
    it('retrieves the job from the repository', async () => {
      // When
      await getJob(jobId)
      // Then
      expect(jobsRepositoryStub.get).to.have.been.calledWith(jobId)
    })
    it('resolves the retrieved job', async () => {
      // When
      const actual = await getJob(jobId)
      // Then
      expect(actual).to.deep.equal(expectedJob)
    })
    context('when job is unknown', () => {
      const unknownJobId = uuid()
      beforeEach(() => jobsRepositoryStub.get.resolves(undefined))
      it('rejects with a UnknownJobError', async () => {
        try {
          await getJob(unknownJobId)
          expect.fail('No exceptions')
        } catch (actual) {
          expect(actual).to.be.an.instanceOf(UnknownJobError)
          expect(actual.message).to.include(unknownJobId)
        }
      })
    })
  })
})

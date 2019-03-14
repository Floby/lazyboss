const uuid = require('uuid/v4')
const { expect } = require('chai')

const JobsRepository = require('../src/infra/jobs.repository')

describe('JobsRepository', () => {
  let jobsRepository
  beforeEach(() => {
    jobsRepository = JobsRepository()
  })
  describe('.save(job)', () => {
    it('returns a promise', () => {
      // Given
      const job = {
        id: uuid()
      }
      // Then
      expect(jobsRepository.save(job)).to.be.an.instanceOf(Promise)
    })
  })
  describe('.get(jobId)', () => {
    context('When job does not exist', () => {
      it('resolves undefined', async () => {
        // Given
        const jobId = uuid()
        // When
        const actual = await jobsRepository.get(jobId)
        // Then
        expect(actual).to.be.undefined
      })
    })
    context('after calling .save(job)', () => {
      const job = { id: uuid() }
      beforeEach(() => jobsRepository.save(job))
      it('resolves the job', async () => {
        const actual = await jobsRepository.get(job.id)
        expect(actual).to.deep.equal(job)
      })

      context('for another id', () => {
        it('resolves undefined', async () => {
          const actual = await jobsRepository.get(uuid())
          expect(actual).to.be.undefined
        })
      })
    })
  })
})

const delay = require('delay')
const uuid = require('uuid/v4')
const { expect } = require('chai')
const Job = require('../src/domain/job')

const JobsRepository = require('../src/infra/jobs.repository')

describe('REPOSITORY JobsRepository', () => {
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

  describe('.listPending()', () => {
    context('when there are no jobs at all', () => {
      it('resolves []', async () => {
        const actual = await jobsRepository.listPending()
        expect(actual).to.be.empty
      })
    })
    context('when there a pending jobs', () => {
      const firstPendingJob = new Job({})
      const secondPendingJob = new Job({})
      beforeEach(() => jobsRepository.save(firstPendingJob))
      beforeEach(() => jobsRepository.save(secondPendingJob))
      it('resolves a list of pending jobs', async () => {
        const actual = await jobsRepository.listPending()
        expect(actual).to.have.length(2)
        expect(actual).to.include(firstPendingJob)
        expect(actual).to.include(secondPendingJob)
      })
      context('and also jobs with other statuses', () => {
        beforeEach(() => jobsRepository.save(Job({ status: 'assigned' })))
        beforeEach(() => jobsRepository.save(Job({ status: 'working' })))
        beforeEach(() => jobsRepository.save(Job({ status: 'working' })))
        it('resolves a list of only pending jobs', async () => {
          const actual = await jobsRepository.listPending()
          expect(actual).to.have.length(2)
          expect(actual).to.include(firstPendingJob)
          expect(actual).to.include(secondPendingJob)
        })
      })
    })
  })
})

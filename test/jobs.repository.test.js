const delay = require('delay')
const uuid = require('uuid/v4')
const { expect } = require('chai')
const Job = require('../src/domain/job')

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

  describe('.observePending()', () => {
    context('when no job is added', () => {
      it('hangs', async function () {
        // Given
        let observed = false
        // When
        await Promise.race([
          jobsRepository.observePending().then(() => { observed = true }),
          delay(200)
        ])
        // Then
        expect(observed).to.equal(false)
      })
    })
    context('when a working job is saved after the start', () => {
      it('hangs', async () => {
        // Given
        let observed = false
        const job = new Job({ status: 'working' })
        // When
        delay(50).then(() => jobsRepository.save(job))
        await Promise.race([
          jobsRepository.observePending().then(() => { observed = true }),
          delay(200)
        ])
        // Then
        expect(observed).to.equal(false)
      })
    })
    context('when a pending job is saved after the start', () => {
      it('resolves with the pending job', async () => {
        // Given
        const job = new Job({ status: 'pending' })
        // When
        delay(50).then(() => jobsRepository.save(job))
        const actual = await jobsRepository.observePending()
        // Then
        expect(actual).to.equal(job)
      })
    })
  })
})

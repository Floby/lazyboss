const delay = require('delay')
const { expect } = require('./utils')
const JobAnnouncer = require('../src/infra/job.announcer')

describe('JobAnnouncer()', () => {
  let jobAnnouncer
  beforeEach(() => {
    jobAnnouncer = new JobAnnouncer()
  })

  describe('.awaitJobs()', () => {
    it('hangs', async () => {
      // Given
      let observed = false
      // When
      await Promise.race([
        jobAnnouncer.awaitJobs().then(() => { observed = true }),
          delay(200)
      ])
      // Then
      expect(observed).to.equal(false)
    })
    context('when .announceJobs() is called', () => {
      it('resolves', async () => {
        // Given
        const jobPromise = jobAnnouncer.awaitJobs()
        // When
        jobAnnouncer.announceJobs()
        // Then
        await jobPromise
      })
    })
  })
})

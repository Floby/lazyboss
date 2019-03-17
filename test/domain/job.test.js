const { expect, matchUuid } = require('../utils')
const Job = require('../../src/domain/job')
const Attempt = require('../../src/domain/attempt')

describe('DOMAIN', () => {
  describe('new Job({ type, parameters })', () => {
    const type = 'some-processing'
    const parameters = { some: 'data' }
    let job
    beforeEach(() => {
      job = new Job({ type, parameters })
    })
    describe('.toJSON()', () => {
      it('returns a json representation of the job', () => {
        // When
        const actual = job.toJSON()
        // Then
        expect(actual).to.deep.contain({ type, parameters, status: 'pending' })
        expect(actual).to.have.property('id').to.match(matchUuid.regex)
      })
    })

    describe('.assign(worker)', () => {
      const worker = { id: 'hey' }
      it('changes the status to "assigned"', () => {
        // When
        job.assign(worker)
        // Then
        expect(job.toJSON()).to.have.property('status').to.equal('assigned')
      })
      it('adds the worker as assignee', () => {
        // When
        job.assign(worker)
        // Then
        expect(job.toJSON()).to.have.property('assignee').to.deep.equal(worker)
      })
      it('returns an attempt', () => {
        // When
        const actual = job.assign(worker)
        // Then
        expect(actual).to.be.an.instanceOf(Attempt)
        expect(actual.worker).to.equal(worker)
        expect(actual.job).to.equal(job)
      })
    })
  })
})

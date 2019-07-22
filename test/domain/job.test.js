const { expect, matchUuid } = require('../utils')
const Job = require('../../src/domain/job')
const Attempt = require('../../src/domain/attempt')
const { JobLifeCycleError } = require('../../src/domain/errors')

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
        expect(job.assignee).to.equal(worker)
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
    describe('.complete(result)', () => {
      const worker = { id: 'worker' }
      const result = { my: 'result' }
      beforeEach(() => {
        job.assign(worker)
      })
      it('changes its status to "done"', () => {
        // When
        job.complete(result)
        // Then
        expect(job.status).to.equal('done')
      })
      it('copies the result', () => {
        // When
        job.complete(result)
        // Then
        expect(job.result).to.deep.equal(result)
        expect(job.result).not.to.equal(result)
      })
      context('if status was already "done"', () => {
        beforeEach(() => {
          job = Job({ status: 'done' })
        })
        it('throw a JobLifeCycleError', () => {
          expect(() => job.complete(result)).to.throw(JobLifeCycleError)
        })
      })
      context('if status was "pending"', () => {
        beforeEach(() => {
          job = Job({ status: 'pending' })
        })
        it('throw a JobLifeCycleError', () => {
          expect(() => job.complete(result)).to.throw(JobLifeCycleError)
        })
      })
    })
    describe('.fail(reason)', () => {
      const worker = { id: 'worker' }
      const reason = { my: 'reason' }
      beforeEach(() => {
        job.assign(worker)
      })
      it('changes its status to "failed"', () => {
        // When
        job.fail(reason)
        // Then
        expect(job.status).to.equal('failed')
      })
      it('copies the reason of the failure', () => {
        // When
        job.fail(reason)
        // Then
        expect(job.failure).to.deep.equal(reason)
        expect(job.failure).not.to.equal(reason)
      })
      context('if status was "done"', () => {
        beforeEach(() => {
          job = Job({ status: 'done' })
        })
        it('throw a JobLifeCycleError', () => {
          expect(() => job.fail(reason)).to.throw(JobLifeCycleError)
        })
      })
      context('if status was "pending"', () => {
        beforeEach(() => {
          job = Job({ status: 'pending' })
        })
        it('throw a JobLifeCycleError', () => {
          expect(() => job.fail(reason)).to.throw(JobLifeCycleError)
        })
      })
    })
  })
})

'use strict'
const Job = require('../../src/domain/job')
const Attempt = require('../../src/domain/attempt')
const { sinon, expect, matchShortId } = require('../utils')
const { AttemptAlreadyFinishedError } = require('../../src/domain/errors')

describe('DOMAIN', () => {
  describe('new Attempt()', () => {
    let worker, job, result, attempt
    beforeEach(() => {
      worker = { id: 'hey' }
      job = new Job({ type: 'something' })
      result = { my: 'result' }
      attempt = new Attempt({ worker, job })
    })
    describe('.toJSON()', () => {
      it('outputs a JSON representation', () => {
        // Given
        attempt = new Attempt({ worker, job, result })
        // When
        const actual = attempt.toJSON()
        // Then
        expect(actual).to.deep.contain({
          worker, job: job.toJSON(), result
        })
        expect(actual).to.have.property('id').to.match(matchShortId.regex)
      })
    })
    describe('.worker', () => {
      it('returns the worker', () => {
        expect(attempt.worker).to.equal(worker)
      })
      it('is not assignable', () => {
        expect(() => attempt.worker = 8).to.throw(TypeError)
      })
    })
    describe('.job', () => {
      it('returns the job', () => {
        expect(attempt.job).to.equal(job)
      })
      it('is not assignable', () => {
        expect(() => attempt.job = 8).to.throw(TypeError)
      })
    })

    describe('.finish(result)', () => {
      const result = { some: 'result', to: 'processing' }
      beforeEach(() => {
        sinon.stub(job, 'complete')
        sinon.stub(job, 'fail')
      })
      it('sets the result', () => {
        // When
        attempt.finish(result)
        // Then
        expect(attempt.result).to.deep.equal(result)
        expect(attempt.result).not.to.equal(result)
      })
      it('calls job.complete(result)', () => {
        // When
        attempt.finish(result)
        // Then
        expect(attempt.job.complete).to.have.been.calledWith(result)
      })
      context('when attempt already has a failure', () => {
        beforeEach(() => attempt.fail({ some: 'reason' }))
        it('fails with a AttemptAlreadyFinishedError', () => {
          expect(() => {
            attempt.finish(result)
          }).to.throw(AttemptAlreadyFinishedError)
        })
      })
      context('when attempt already has a success', () => {
        beforeEach(() => attempt.finish({ some: 'result' }))
        it('fails with a AttemptAlreadyFinishedError', () => {
          expect(() => {
            attempt.finish(result)
          }).to.throw(AttemptAlreadyFinishedError)
        })
      })
    })
    describe('.fail(reason)', () => {
      const reason = { some: 'reason', to: 'fail' }
      beforeEach(() => {
        sinon.stub(job, 'complete')
        sinon.stub(job, 'fail')
      })
      it('sets the reason of the failure', () => {
        // When
        attempt.fail(reason)
        // Then
        expect(attempt.failure).to.deep.equal(reason)
        expect(attempt.failure).not.to.equal(reason)
      })
      it('calls job.fail(reason)', () => {
        // When
        attempt.fail(reason)
        // Then
        expect(attempt.job.fail).to.have.been.calledWith(reason)
        expect(attempt.job.complete).not.to.have.been.called
      })
      context('when attempt already has a failure', () => {
        beforeEach(() => attempt.fail({ some: 'reason' }))
        it('fails with a AttemptAlreadyFinishedError', () => {
          expect(() => {
            attempt.fail(reason)
          }).to.throw(AttemptAlreadyFinishedError)
        })
      })
      context('when attempt already has a success', () => {
        beforeEach(() => attempt.finish({ some: 'result' }))
        it('fails with a AttemptAlreadyFinishedError', () => {
          expect(() => {
            attempt.fail(reason)
          }).to.throw(AttemptAlreadyFinishedError)
        })
      })
    })
  })
})

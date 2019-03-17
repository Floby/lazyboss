'use strict'
const Job = require('../../src/domain/job')
const Attempt = require('../../src/domain/attempt')
const { sinon, expect, matchShortId } = require('../utils')

describe('DOMAIN', () => {
  describe('new Attempt()', () => {
    let worker, job, result, attempt
    beforeEach(() => {
      worker = { id: 'hey' }
      job = new Job({ type: 'something' })
      result = { my: 'result' }
      attempt = new Attempt({ worker, job, result })
    })
    describe('.toJSON()', () => {
      it('outputs a JSON representation', () => {
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
    })
  })
})

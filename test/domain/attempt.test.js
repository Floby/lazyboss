'use strict'
const Job = require('../../src/domain/job')
const Attempt = require('../../src/domain/attempt')
const { expect, matchShortId } = require('../utils')

describe('DOMAIN', () => {
  describe('new Attempt()', () => {
    const worker = { id: 'hey' }
    const job = new Job({ type: 'something' })
    const attempt = new Attempt({ worker, job })
    describe('.toJSON()', () => {
      it('outputs a JSON representation', () => {
        // When
        const actual = attempt.toJSON()
        // Then
        expect(actual).to.deep.contain({
          worker, job: job.toJSON()
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
  })
})

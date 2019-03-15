const shortid = require('shortid')
const delay = require('delay')
const uuid = require('uuid/v4')
const { expect } = require('chai')
const Attempt = require('../src/domain/attempt')
const Job = require('../src/domain/job')

const AttemptsRepository = require('../src/infra/attempts.repository')

describe('AttemptsRepository', () => {
  let attemptsRepository
  beforeEach(() => {
    attemptsRepository = AttemptsRepository()
  })
  const job = new Job({})
  const worker = { id: 'some-id' }
  const attemptId = shortid()
  const attempt = Attempt({ id: attemptId, worker, job })
  describe('.save(attempt)', () => {
    it('returns a promise', () => {
      // When
      const actual = attemptsRepository.save(attempt)
      // Then
      expect(actual).to.be.an.instanceOf(Promise)
    })
  })
  describe('get(attemptId)', () => {
    it('resolves undefined', async () => {
      const actual = await attemptsRepository.get(attemptId)
      expect(actual).to.be.undefined
    })
    context('after calling .save(attempt)', () => {
      beforeEach(() => attemptsRepository.save(attempt))
      it('resolves the attempt', async () => {
        const actual = await attemptsRepository.get(attemptId)
        expect(actual).to.equal(attempt)
      })
      context('for another id', () => {
        const attemptId = shortid()
        it('resolves undefined', async () => {
          const actual = await attemptsRepository.get(attemptId)
          expect(actual).to.be.undefined
        })
      })
    })
  })
})

const shortid = require('shortid')
const delay = require('delay')
const uuid = require('uuid/v4')
const { expect } = require('chai')
const Vacancy = require('../src/domain/vacancy')
const Job = require('../src/domain/job')

const VacanciesRepository = require('../src/infra/vacancies.repository')

describe('REPOSITORY VacanciesRepository', () => {
  let vacanciesRepository
  beforeEach(() => {
    vacanciesRepository = VacanciesRepository()
  })
  const job = new Job({})
  const worker = { id: 'some-id' }
  const vacancyId = shortid()
  const vacancy = Vacancy({ id: vacancyId, worker, job })
  describe('.save(vacancy)', () => {
    it('returns a promise', () => {
      // When
      const actual = vacanciesRepository.save(vacancy)
      // Then
      expect(actual).to.be.an.instanceOf(Promise)
    })
  })
  describe('get(vacancyId)', () => {
    it('resolves undefined', async () => {
      const actual = await vacanciesRepository.get(vacancyId)
      expect(actual).to.be.undefined
    })
    context('after calling .save(vacancy)', () => {
      beforeEach(() => vacanciesRepository.save(vacancy))
      it('resolves the vacancy', async () => {
        const actual = await vacanciesRepository.get(vacancyId)
        expect(actual).to.equal(vacancy)
      })
      context('for another id', () => {
        const vacancyId = shortid()
        it('resolves undefined', async () => {
          const actual = await vacanciesRepository.get(vacancyId)
          expect(actual).to.be.undefined
        })
      })
    })
  })
})

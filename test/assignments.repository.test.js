const { expect } = require('./utils')
const AssignmentsRepository = require('../src/infra/assignments.repository')

describe('REPOSITORY AssignmentsRepository', () => {
  const jobId = 'f198a648-a997-11e9-a615-7f2dedf8a10a'
  const attemptId = '4er7hbT'
  const assignment = { jobId, attemptId }
  let assignmentsRepository
  beforeEach(() => {
    assignmentsRepository = AssignmentsRepository()
  })
  describe('.set({ jobId, attemptId })', () => {
    it('resolves', () => {
      return assignmentsRepository.set(assignment).then(() => true)
    })
    context('when the same assignment already exists', () => {
      beforeEach(() => assignmentsRepository.set(assignment))
      it('resolves', () => {
        return assignmentsRepository.set(assignment).then(() => true)
      })
    })
    context('when an assignment with the same jobId exists', () => {
      beforeEach(() => {
        return assignmentsRepository.set({ jobId, attemptId: '87uYvvBn' })
      })
      it('rejects', () => {
        return expect(assignmentsRepository.set(assignment))
          .to.eventually.be.rejectedWith(/already assigned/i)
      })
    })
    context('when an assignment with the same attemptId exists', () => {
      beforeEach(() => {
        return assignmentsRepository.set({ attemptId, jobId: '8730a0a6-a999-11e9-8ea9-1f650a5b3d1c' })
      })
      it('rejects', () => {
        return expect(assignmentsRepository.set(assignment))
          .to.eventually.be.rejectedWith(/already assigned/i)
      })
    })
  })
  describe('.unset({ jobId, attemptId })', () => {
    context('when assignment does not exist', () => {
      it('resolves', () => assignmentsRepository.unset(assignment).then(() => true))
    })
    context('when assignment exists', () => {
      beforeEach(() => assignmentsRepository.set(assignment))
      it('resolves', () => assignmentsRepository.unset(assignment).then(() => true))
      describe('next .set() with same attemptId', () => {
        beforeEach(() => assignmentsRepository.unset(assignment))
        it('resolves', () => assignmentsRepository.set({ attemptId, jobId: '8730a0a6-a999-11e9-8ea9-1f650a5b3d1c' }).then(() => true))
      })
      describe('next .set() with same jobId', () => {
        beforeEach(() => assignmentsRepository.unset(assignment))
        it('resolves', () => assignmentsRepository.set({ jobId, attemptId: '454FGggf' }).then(() => true))
      })
    })
  })
})

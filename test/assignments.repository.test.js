const { expect } = require('./utils')
const AssignmentsRepository = require('../src/infra/assignments.repository')

describe('REPOSITORY AssignmentsRepository', () => {
  let assignmentsRepository
  beforeEach(() => {
    assignmentsRepository = AssignmentsRepository()
  })
  describe('.set({ jobId, attemptId })', () => {
    const jobId = 'f198a648-a997-11e9-a615-7f2dedf8a10a'
    const attemptId = '4er7hbT'
    const assignment = { jobId, attemptId }
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
})

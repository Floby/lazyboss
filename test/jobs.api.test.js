const uuid = require('uuid/v4')
const { expect, describeWithApi, sinon } = require('./utils')
const { UnknownJobError } = require('../src/domain/errors')

describeWithApi((api, usecases) => {
  describe('POST /jobs', () => {
    const payload = {}
    const expectedCreationCommand = {}
    beforeEach(() => {
      usecases.createJob = sinon.stub().resolves()
    })
    it('calls usecase createJob(jobCreationCommand)', async () => {
      // When
      await api().post('/jobs').send(payload)
      // Then
      expect(usecases.createJob).to.have.been.calledWith(expectedCreationCommand)
    })

    it('replies 202', async () => {
      await api().post('/jobs').send(payload)
        .expect(202)
    })
    it('replies a location header to get the created job', async () => {
      // Given
      const expectedUuid = uuid()
      usecases.createJob.resolves(expectedUuid)
      // When
      await api().post('/jobs').send(payload)
        .expect('Location', `/jobs/${expectedUuid}`)
    })
  })

  describe('GET /jobs/{jobId}', () => {
    const job = { id: uuid() }
    const jobId = job.id
    beforeEach(() => {
      usecases.getJob = sinon.stub().resolves()
      usecases.getJob.resolves(job)
    })
    it('replies a 200', async () => {
      await api().get(`/jobs/${jobId}`)
        .expect(200)
    })
    it('replies the job', async () => {
      await api().get(`/jobs/${jobId}`)
        .expect(job)
    })
    it('calls getJob with correct id', async () => {
      await api().get(`/jobs/${jobId}`)
      expect(usecases.getJob).to.have.been.calledWith(jobId)
    })
    context('when id is malformed', () => {
      const jobId = 'hello'
      it('replies 400', async () => {
        await api().get(`/jobs/${jobId}`)
          .expect(400)
      })
      it('does not call getJob', async () => {
        await api().get(`/jobs/${jobId}`)
        expect(usecases.getJob).not.to.have.been.called
      })
    })
    context('When job does not exist', () => {
      beforeEach(() => usecases.getJob.rejects(new UnknownJobError(jobId)))
      it('replies 404', async () => {
        await api().get(`/jobs/${jobId}`)
          .expect(404)
      })
    })
  })
})

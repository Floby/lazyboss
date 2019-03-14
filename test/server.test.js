const supertest = require('supertest')
const { createServer } = require('../')

describe('The server', () => {
  const port = 9988
  const config = new Map()
  config.set('PORT', port)

  let server
  beforeEach(async () => {
    server = await createServer(config)
    await server.start()
  })
  it('starts on given port', async () => {
    await supertest(`http://localhost:${port}`)
      .get('/')
      .expect(200)
  })
  afterEach(() => server.stop())
})

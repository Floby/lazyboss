const supertest = require('supertest')
const { createServer } = require('../')
require('chai').use(require('sinon-chai'))
const { expect } = require('chai')
const sinon = require('sinon')
const mocha = require('mocha')

exports.sinon = sinon
exports.expect = expect

exports.describeWithApi = function (suite, describeFn = mocha.describe) {
  describeFn('API', () => {
    const port = Math.round(Math.random() * 1000) + 9000
    const config = new Map()
    config.set('PORT', port)

    let server
    const usecases = {}
    beforeEach(async () => {
      server = await createServer(config, usecases)
      await server.start()
    })
    afterEach(() => {
      for (let key in usecases) {
        delete usecases[key]
      }
    })
    afterEach(() => server.stop())

    function api () {
      return supertest(`http://localhost:${port}`)
    }
    suite(api, usecases)
  })
}

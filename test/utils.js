const shortid = require('shortid')
const supertest = require('supertest')
const { createServer } = require('../')
require('chai').use(require('sinon-chai'))
require('chai').use(require('chai-exclude'))
require('chai').use(require('chai-as-promised'))
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


exports.fail = function fails (msg='FAILURE') {
  throw Error (msg)
}

exports.matchUuid = function matchUuid() {
  return sinon.match(exports.matchUuid.regex)
}
exports.matchUuid.regex = /^[0-9a-f]{8}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{12}$/i

exports.matchShortId = function matchShortId() {
  return sinon.match(exports.matchShortId.regex)
}
exports.matchShortId.regex = /^[a-zA-Z0-9_-]{7,14}$/

exports.matchJSON = (expected) => {
  return sinon.match((actual) => {
    expect(actual.toJSON()).to.deep.equal(expected)
  })
}

exports.trap = function () {
  const trap = { value: () => { throw Error('not captured') } }
  trap.capture = sinon.match((value) => {
    trap.value = () => value
  })
  return trap
}

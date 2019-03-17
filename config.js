const ms = require('ms')
const { Envie } = require('envie')
const Joi = require('envie').Joi.extend(require('joi-duration-extensions'))

module.exports = Envie({
  PORT: Joi
    .number()
    .description('The port on which to listen')
    .default(8080),
  LONG_POLLING_TIMEOUT: Joi
    .number()
    .msDuration()
    .description('The time in milliseconds or duration descriptor to hold a polling connection before giving up')
    .example('20 seconds')
    .example('1 minute')
    .default(ms('20 seconds'))
})

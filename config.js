const { Envie, Joi } = require('envie')

module.exports = Envie({
  PORT: Joi
    .number()
    .description('The port on which to listen')
    .default(8080)
})

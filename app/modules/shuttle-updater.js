const winston = require('winston')

module.exports = {
  checkUpdate: () => {
    winston.log('no update :(')
  },
  doUpdate: () => {
  	winston.log('downloading update...')
  	winston.log('error :(')
  }
}

const lowdb = require('lowdb')
const path = require('path')

const FileSync = require('lowdb/adapters/FileSync')
const langFile = new FileSync(path.join(__dirname, '/lang.json'))
const lang = lowdb(langFile)

module.exports = (message, location = navigator.language) => {
  switch (location) {
    case 'fr_BE':
    case 'fr_CA':
    case 'fr_FR':
    case 'fr':
      return lang.get(`fr.${message}`).value()
    default:
      return lang.get(`en.${message}`).value()
  }
}
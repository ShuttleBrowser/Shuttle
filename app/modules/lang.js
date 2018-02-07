const lowdb = require('lowdb')

const FileSync = require('lowdb/adapters/FileSync')
const langFile = new FileSync(`./assets/lang.json`)
const lang = lowdb(langFile)

module.exports = (message) => {
    switch (`${navigator.language}`) {
        case 'fr':
            return lang.get(`fr.${message}`).value()
            break
        default:
            return lang.get(`en.${message}`).value()  
    }
}
const osLocale = require('os-locale')
const availableLanguages = ['fr_FR', 'en_US']

let langPath

module.exports = (value) => {
  if (process.type === 'renderer') {
    langPath = require(`${require('electron').remote.app.getAppPath()}/lang/${osLocale.sync()}/messages.json`)
  } else {
    langPath = require(`${__dirname}/${osLocale.sync()}/messages.json`)
  }

  let lang = langPath

  if (!availableLanguages.includes(osLocale.sync())) {
    lang = require(`${__dirname}/en_US/messages.json`)
  }
  for (let i in lang) {
    if (lang[i].value === value) {
      return lang[i].message
    }
  }
}
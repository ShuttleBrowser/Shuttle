const winston = require('winston')
const {dialog, autoUpdater} = require('electron')

let currentVersion = require('../../package.json').version
console.log(currentVersion)
let newVersion = "2.0.0"

let doUpdate = () => {
  winston.log('downloading update...')
  winston.log('error :(')
}

autoUpdater.setFeedURL(`localhost:3000`)

module.exports = {
  checkUpdate: () => {
    if (currentVersion != newVersion) {
      let choice = dialog.showMessageBox({
        type: 'question',
        buttons: ["Oui", "Non"],
        title: 'Updater',
        message: "An update is currently availible, would you like to restart for updating ?"
      })
      if (choice === 0) {
        doUpdate()
      } else {
        console.log("No updated")
      }
    } else {
      winston.info('no update are availible')
    }
  },
}

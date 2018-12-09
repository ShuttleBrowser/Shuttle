// const winston = require('winston')
const {dialog, app} = require('electron')
const {autoUpdater} = require('electron-updater')
const lang = require(`../lang/lang.js`)

// -------------------------------------------------------------------
// Auto updates
// -------------------------------------------------------------------
app.on('ready', () => {
  autoUpdater.checkForUpdates()
})

setInterval(() => {
  autoUpdater.checkForUpdates()
}, 120000)

autoUpdater.on('checking-for-update', () => {
  console.log('checking for update')
})
autoUpdater.on('update-available', info => {
  console.log('update available')
})
autoUpdater.on('update-not-available', info => {
  console.log('no update available')
})
autoUpdater.on('error', err => {
  console.log(err)
})
autoUpdater.on('download-progress', progressObj => {
  console.log(`Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred} + '/' + ${progressObj.total} + )`)
})
autoUpdater.on('update-downloaded', info => {
  notifyQuitAndinstall()
})

let notifyQuitAndinstall = () => {
  let choice = dialog.showMessageBox({
    type: 'question',
    buttons: [`${lang('CONTINUE_BUTTON')}`, `${lang('CANCEL_BUTTON')}`],
    title: 'Updater',
    message: lang('UPDATE_AVAILIBLE')
  })
  if (choice === 0) {
    autoUpdater.quitAndInstall()
  }
}

let checkUpdate = () => {
  autoUpdater.checkForUpdatesAndNotify()
}

exports.checkUpdate = checkUpdate

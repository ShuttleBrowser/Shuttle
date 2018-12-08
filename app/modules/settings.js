const { remote, ipcRenderer } = require('electron')
const AutoLaunch = require('auto-launch')
const fs = require('fs')
const saveAs = require('file-saver')
const files = require('./files')

const { app } = require('electron').remote

let ShuttleAutoLauncher = new AutoLaunch({
  name: 'Shuttle'
})

let settingsIsShow = false

EventsEmitter.on('SHOW_SETTINGS', (bool) => {
  let settingsView = document.querySelector('.settings')
  if (bool === true) {
    settingsView.style.display = 'block'
    settingsIsShow = true
  } else if (bool === false) {
    settingsView.style.display = 'none'
    settingsIsShow = false
  } else {
    if (settingsIsShow) {
      settingsView.style.display = 'none'
      settingsIsShow = false
    } else {
      settingsView.style.display = 'block'
      settingsIsShow = true
    }
  }
})

const settings = {
  setAccountBtn () {
    if (files.settings.getValue('settings.isLogged')) {
      document.querySelector('input[name=logout]').style.display = 'block'
      document.querySelector('input[name=singin]').style.display = 'none'

      document.querySelector('input[name=accountSettings]').disabled = false
      document.querySelector('input[name=syncButton]').disabled = false
    } else {
      document.querySelector('input[name=logout]').style.display = 'none'
      document.querySelector('input[name=singin]').style.display = 'block'

      document.querySelector('input[name=accountSettings]').disabled = true
      document.querySelector('input[name=syncButton]').disabled = true
    }
  },

  setCheckBox () {
    let checkboxAutoStart = document.querySelector('input[name=SAboot]')
    let checkboxStayOpen = document.querySelector('input[name=SOpen]')
    let checkboxShowFrame = document.querySelector('input[name=SFrame]')
    let checkboxSync = document.querySelector('input[name=syncButton]')

    if (files.settings.getValue('settings.autostart') || files.settings.getValue('settings.autostart') === undefined) {
      checkboxAutoStart.checked = true
    }
    if (files.settings.getValue('settings.StayOpen')) {
      checkboxStayOpen.checked = true
    }
    if (files.settings.getValue('settings.ShowFrame')) {
      checkboxShowFrame.checked = true
    }
    if (files.settings.getValue('settings.sync') === true || files.settings.getValue('settings.sync') === undefined) {
      checkboxSync.checked = true
    }
  },

  setLang () {
    document.getElementById('startAtBoot').innerHTML = lang('SETTINGS_START_AT_BOOT')
    document.getElementById('stayOpen').innerHTML = lang('SETTINGS_STAY_OPEN')
    document.getElementById('showFrame').innerHTML = lang('SETTINGS_SHOW_FRAME')
    document.getElementById('bkms').innerHTML = lang('SETTINGS_BOOKMARKS')
    document.getElementById('Export').innerHTML = lang('SETTINGS_EXPORT_BOKMARKS')
    document.getElementById('Import').innerHTML = lang('SETTINGS_IMPORT_BOKMARKS')
    document.getElementById('Reset').innerHTML = lang('SETTINGS_RESET_BOOKMARKS')
    document.getElementById('advanced').innerHTML = lang('SETTINGS_ADVANCED')
    document.getElementById('showConsole').innerHTML = lang('SETTINGS_SHOW_CONSOLE')
    document.getElementById('clearCache').innerHTML = lang('SETTINGS_CLEAR_CACHE')
    document.getElementById('reportBug').innerHTML = lang('SETTINGS_REPORT_BUG')
    document.getElementById('accountTitle').innerHTML = lang('SETTINGS_ACCOUNT')
  },

  setAutoStart () {
    let checkboxAutoStart = document.querySelector('input[name=SAboot]')
    if (checkboxAutoStart.checked) {
      files.settings.setValue('settings.autostart', true)
      ShuttleAutoLauncher.enable()
      console.log(`Autostart: ${checkboxAutoStart.checked}`)
    } else {
      files.settings.setValue('settings.autostart', false)
      ShuttleAutoLauncher.disable()
      console.log(`Autostart: ${checkboxAutoStart.checked}`)
    }
  },

  setStayOpen () {
    let checkboxStayOpen = document.querySelector('input[name=SOpen]')
    files.settings.setValue('settings.StayOpen', checkboxStayOpen.checked)
    ipcRenderer.send('SettingSetAlwaysOnTop', checkboxStayOpen.checked)
    console.log(`StayOpen: ${checkboxStayOpen.checked}`)
  },

  setShowFrame () {
    let checkboxShowFrame = document.querySelector('input[name=SFrame]')
    files.settings.setValue('settings.ShowFrame', checkboxShowFrame.checked)
    if (checkboxShowFrame.checked === true) {
      document.querySelector('.title-bar').style.top = '0px'
      document.querySelector('webview').style.top = '15px'
      this.changeViewsSize(15)
    } else {
      document.querySelector('.title-bar').style.top = '-15px'
      document.querySelector('webview').style.top = '0px'
      this.changeViewsSize(0)
    }
    console.log(`ShowFrame: ${checkboxShowFrame.checked}`)
  },

  downloadButton () {
    console.log(`download button is clicked`)
    this.downloadFavorites()
  },

  uploadButton () {
    console.log(`upload button is clicked`)
    this.uploadFavorites()
  },

  resetButton () {
    console.log(`reset button is clicked`)
    this.resetFavorites()
  },

  hideControlBar () {
    EventsEmitter.emit('SHOW_CONTROL_BAR', {
      id: 0,
      show: false
    })
  },

  // Button for show developper console
  showConsoleButton () {
    console.log(`Show console button is clicked`)
    remote.getCurrentWindow().openDevTools()
  },

  // Button for report a bug
  reportBugButton () {
    let shuttleVersion = app.getVersion()
    let osPlatform = process.platform
    let osVersion = require('os').release
    let arch = process.arch
    let electronVerison = process.versions.electron
    let nodeVerison = process.versions.node
    let chromiumVerison = process.versions.chrome
    let v8Verison = process.versions.v8
    let mailContent = [
      `Shuttle version : ${shuttleVersion}%0A` +
      `OS : ${osPlatform}%0A` +
      `OS Version : ${osVersion}%0A` +
      `Computer Arch : ${arch}%0A` +
      `Electron : ${electronVerison}%0A` +
      `NodeJS : ${nodeVerison}%0A` +
      `Chromium : ${chromiumVerison}%0A` +
      `V8 : ${v8Verison}%0A`
    ]
    console.log(`report bug button is clicked`)
    remote.shell.openExternal(`mailto:support@shuttleapp.io&subject=bug shuttle-${shuttleVersion}?body=${mailContent}`)
  },

  clearCacheButton () {
    console.log(`clear cache button is clicked`)
    let win = remote.getCurrentWindow()
    win.webContents.session.clearCache(() => {
      alert('cache is cleared')
    })
  },

  changeViewsSize (size) {
    let views = document.querySelectorAll('webview')
    for (let i in views) {
      if (i > views.length - 1) {
        break
      } else {
        views[i].style.top = `${size}px`
      }
    }
  },

  downloadFavorites () {
    let data = fs.readFileSync(`${app.getPath('userData')}/bookmarks.json`, 'utf8')
    let fileToSave = new Blob([data], {
      type: 'application/json',
      name: 'myBookmarks.shtd'
    })
    saveAs(fileToSave, 'myBookmarks.shtd')
  },

  uploadFavorites () {
    remote.dialog.showOpenDialog({ filters: [{ name: 'Shuttle data', extensions: ['shtd'] }] }, (fileNames) => {
      if (fileNames === undefined) {
        console.log('No file selected')
      } else {
        console.log(fileNames[0])
        fs.createReadStream(fileNames[0]).pipe(fs.createWriteStream(`${app.getPath('userData')}/bookmarks.json`))
        location.reload()
      }
    })
  },

  resetFavorites () {
    let choice = remote.dialog.showMessageBox({
      type: 'question',
      buttons: ['continue', 'cancel'],
      title: 'Reset',
      message: 'Reset all bookmarks ?'
    })
    if (choice === 0) {
      console.log('Reset...')
      fs.writeFile(`${app.getPath('userData')}/bookmarks.json`, '', (err) => {
        if (err) {
          return console.log(err)
        }
        location.reload()
      })
    }
  },

  setSync () {
    let checkboxSync = document.querySelector('input[name=syncButton]')
    files.settings.setValue('settings.sync', checkboxSync.checked)
  },

  logout () {
    files.settings.setValue('settings.isLogged', false)
    files.settings.setValue('settings.userToken', '')
    EventsEmitter.emit('SHOW_AUTH')
  }
}

module.exports = settings
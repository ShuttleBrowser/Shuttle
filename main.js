// Import libs
const { app, shell, ipcMain } = require('electron')
const menubar = require('menubar')

require('./main/events.js')
const contextMenu = require('./main/menu.js')
const files = require('./app/modules/files.js')

// set window variable
let mb

const shuttle = {
  // create window
  createAppWindows () {
    mb = new menubar({
      icon: `${__dirname}/main/icon.png`,
      index: `${__dirname}/app/index.html`,
      width: 395,
      minWidth: 395,
      height: 645,
      minHeight: 645,
      title: 'Shuttle',
      autoHideMenuBar: true,
      frame: files.settings.getValue('settings.ShowFrame') || false,
      skipTaskbar: true,
      backgroundColor: '#ffffff',
      preloadWindow: true,
      alwaysOnTop: files.settings.getValue('settings.StayOpen') || false,
      resizable: true,
      webPreferences: {
        webSecurity: false,
        'overlay-fullscreen-video': true,
        webaudio: true,
        webgl: true,
        textAreasAreResizable: true
      }
    })
  }
}

app.on('ready', () => {
  shuttle.createAppWindows()
  mb.tray.setContextMenu(contextMenu)
  app.on('before-quit', () => {
    mb.window.removeAllListeners('close')
    mb.window.close()
  })
})

EventsEmitter.on('SHOW_SHUTTLE', () => {
  mb.showWindow()
})

EventsEmitter.on('SHOW_ABOUT', () => {
  shell.openExternal('https://shuttleapp.io/about')
})

EventsEmitter.on('SHOW_SETTINGS', () => {
  mb.window.webContents.send('OPEN_SETTINGS')
})

EventsEmitter.on('QUIT_SHUTTLE', () => {
  app.quit()
})

ipcMain.on('PAGE_ALERT', (event, data) => {
  mb.window.webContents.send('ALERT', data)
})

ipcMain.on('SettingSetAlwaysOnTop', (event, arg) => {
  mb.setOption('alwaysOnTop', arg)
  mb.hideWindow()
  setTimeout(() => {
    mb.showWindow()
  }, 5)
})

ipcMain.on('SettingShowFrame', (event, arg) => {
  mb.window.webContents.send('SHOW_FRAME', arg)
})
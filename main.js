const {Menu, ipcMain, BrowserWindow} = require('electron')
const lowdb = require('lowdb')
const menubar = require('menubar')
const winston = require('winston')

const shuttleUpdater = require(`${__dirname}/app/modules/shuttle-updater.js`)

winston.add(winston.transports.File, { filename: `${__dirname}/app/logs/Latest.log` })

winston.info('Lauch app')

// create the window
const mb = menubar({
  icon: `${__dirname}/assets/img/icon.ico`,
  index: `${__dirname}/views/index.html`,
  width: 395,
  height: 640,
  resizable: false,
  title: 'Shuttle',
  autoHideMenuBar: true,
  frame: false,
  skipTaskbar: true,
  alwaysOnTop: true
})

mb.on('ready', () => {
  winston.log('Shuttle is ready')
  mb.tray.setContextMenu(contextMenu)
})

mb.on('after-create-window', () => {
  mb.tray.setContextMenu(contextMenu)
  mb.tray.on('right-click', () => {
    mb.tray.popUpContextMenu(contextMenu)
  })
})

// create the context menu
const contextMenu = Menu.buildFromTemplate([

  // about btn
  {
    label: 'About',
    click () {
      // We open the website at about
      electron.shell.openExternal('https://getshuttle.xyz/')
    }
  },

  // Settings btn
  {
    label: 'Settings',
    click () {
      main.settings()
    }
  },

  // Check update
  {
    label: 'Check for updates',
    click () {
      shuttleUpdater.checkUpdate()
    }
  },

  // wow, a separator !
  {type: 'separator'},

  // quit btn :(
  {
    label: 'Quit',
    click () {
      winston.info('Goodbye !')
      mb.app.quit()
    }
  }

])

ipcMain.on('CheckUpdate', (event, arg) => {
  shuttleUpdater.checkUpdate()
})
ipcMain.on('openSettings', (event, arg) => {
  main.settings()
})
ipcMain.on('CheckUpdate', (event, arg) => {
  winston.info('No update are availible because the udate systeme are not created (lol)')
})

const main = {

  // The settings window
  settings: () => {
    winston.info('open settings window')

    let settingsWin = new BrowserWindow({
      icon: `${__dirname}/assets/img/icon.png`,
      width: 300,
      height: 400,
      resizable: false,
      title: 'Settings',
      preloadWindow: true,
      frame: false,
      alwaysOnTop: true
    })

    settingsWin.loadURL(`${__dirname}/views/settings.html`)
  },

  // The auth window
  authWindow: () => {
      winston.info('open authWindow')

      let authWindow = new BrowserWindow({
        icon: `${__dirname}/assets/img/icon.png`,
        width: 300,
        height: 400,
        resizable: false,
        title: 'Auth',
        preloadWindow: true,
        frame: false,
        alwaysOnTop: true
      })

      authWindow.loadURL(`${__dirname}/views/auth.html`)
    }
}

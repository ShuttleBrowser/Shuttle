const {Menu, ipcMain, app, net, shell, session} = require('electron')
const lowdb = require('lowdb')
const menubar = require('menubar')
const winston = require('winston')
const AutoLaunch = require('auto-launch')
const osLocale = require('os-locale')
const electronLocalshortcut = require('electron-localshortcut')

let os = require("os").platform()
let iconPath

const shuttleUpdater = require(`${__dirname}/app/modules/shuttle-updater.js`)
const locationMsg = require(`${__dirname}/app/modules/lang.js`)

winston.add(winston.transports.File, { filename: `${__dirname}/app/logs/Latest.log` })

winston.info('Lauch app')

// Lowdb db init
const FileSync = require('lowdb/adapters/FileSync')
const LowdbAdapterSettings = new FileSync(`${app.getPath('userData')}/settings.json`)
const settings = lowdb(LowdbAdapterSettings)

// Autolaunch init
let ShuttleAutoLauncher = new AutoLaunch({
  name: 'Shuttle'
})

if (settings.get('settings.autostart').value() === true || settings.get('settings.autostart').value() === undefined) {
  ShuttleAutoLauncher.enable()
} else {
  ShuttleAutoLauncher.disable()
}

if (process.platform == 'darwin' || process.platform == 'linux') {
  iconPath =  __dirname + "/assets/img/icon.png";
} else if (process.platform == 'win32') {
	iconPath = __dirname + "/assets/img/icon.ico";
}

const mb = menubar({
  icon: iconPath,
  index: `file://${__dirname}/views/index.html`,
  width: 395,
  height: 640,
  resizable: false,
  title: 'Shuttle',
  autoHideMenuBar: true,
  frame: false,
  skipTaskbar: true,
  backgroundColor: '#ffffff',
  preloadWindow: true,
  alwaysOnTop: settings.get('settings.StayOpen').value()
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
    label: locationMsg('showShuttle', osLocale.sync()),
    click () {
      mb.showWindow()
    }
  },

  // about btn
  {
    label: locationMsg('about', osLocale.sync()),
    click () {
      // We open the website at about
      shell.openExternal('https://getshuttle.xyz/')
    }
  },

  // Settings btn
  {
    label: locationMsg('settings', osLocale.sync()),
    click () {
      mb.window.webContents.send('openSettings')
    }
  },

  // Check update
  {
    label: locationMsg('checkForUpdates', osLocale.sync()),
    click () {
      shuttleUpdater.checkUpdate()
    }
  },

  // wow, a separator !
  {type: 'separator'},

  // quit btn :(
  {
    label: locationMsg('quit', osLocale.sync()),
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
ipcMain.on('refreshApp', (event, arg) => {
  mb.window.webContents.send('refreshApp')
  console.log('true')
})
ipcMain.on('SettingSetAlwaysOnTop', (event, arg) => {
  mb.setOption('alwaysOnTop', arg)
  mb.hideWindow()
})
ipcMain.on('SettingShowFrame', (event, arg) => {
  mb.window.webContents.send('addframe', arg)
})
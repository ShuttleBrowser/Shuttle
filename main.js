const {Menu, ipcMain, app, net, shell, session, globalShortcut} = require('electron')
const lowdb = require('lowdb')
const menubar = require('menubar')
const winston = require('winston')
const AutoLaunch = require('auto-launch')
const osLocale = require('os-locale')
const electronLocalshortcut = require('electron-localshortcut')

let os = require("os").platform()
let iconPath
let toggleShow = false
let toggleSkipTaskbar
let toggleAlwaysOnTop

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
  name: 'Shuttle',
  path: app.getAppPath()
})

if (settings.get('settings.autostart').value() === true || settings.get('settings.autostart').value() === undefined) {
  ShuttleAutoLauncher.enable()
} else {
  ShuttleAutoLauncher.disable()
}

if (process.platform == 'darwin' || process.platform == 'linux') {
  iconPath =  __dirname + "/assets/img/icon.png";
  toggleSkipTaskbar = false
  toggleAlwaysOnTop = true
} else if (process.platform == 'win32') {
  iconPath = __dirname + "/assets/img/icon.ico";
  toggleSkipTaskbar = true
  toggleAlwaysOnTop = settings.get('settings.StayOpen').value()
}

let mb = menubar({
  icon: iconPath,
  index: `file://${__dirname}/views/index.html`,
  width: 395,
  minWidth: 395,
  height: 645,
  minHeight: 645,
  resizable: false,
  title: 'Shuttle',
  autoHideMenuBar: true,
  frame: false,
  skipTaskbar: toggleSkipTaskbar,
  backgroundColor: '#ffffff',
  preloadWindow: true,
  alwaysOnTop: toggleAlwaysOnTop,
  resizable: settings.get('settings.ResizeWindow').value(),
  webPreferences : {
    webSecurity: false,
    "overlay-fullscreen-video": true,
    webaudio: true,
    webgl: true,
    textAreasAreResizable: true
    }
})

mb.on('ready', () => {
  winston.log('Shuttle is ready')
  mb.tray.setContextMenu(contextMenu)

  mb.showWindow()

  /** LOCAL SHORTCUTS */
  globalShortcut.register('CmdOrCtrl+Shift+X', () => {
    if (!toggleShow) {
      mb.showWindow()
      console.log('show window')
    } else {
      mb.hideWindow()
      console.log('hide window')
    }
  })

  electronLocalshortcut.register(mb.window, 'Escape', () => {
    mb.window.webContents.send('quitFullscreen')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+P', () => {
    mb.window.webContents.send('addBmks')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+H', () => {
    mb.window.webContents.send('home')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+S', () => {
    mb.window.webContents.send('openSettings')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+K', () => {
    mb.window.webContents.send('quicksearch')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+Shift+S', () => {
    mb.window.webContents.send('screenshot')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+Shift+I', () => {
    mb.window.openDevTools()
  })

})

mb.on('after-create-window', () => {
  mb.tray.setContextMenu(contextMenu)
  mb.tray.on('right-click', () => {
    mb.tray.popUpContextMenu(contextMenu)
  })
  console.log(mb.window.getSize()[1])
})

mb.on('hide', () => {
  toggleShow = false
})

mb.on('show', () => {
  toggleShow = true
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
  setTimeout(() => {
    mb.showWindow()
  }, 5)
})
ipcMain.on('SettingShowFrame', (event, arg) => {
  mb.window.webContents.send('addframe', arg)
})

ipcMain.on('SettingResizeWindow', (event, arg) => {
  mb.window.setResizable(arg)
  if (arg === false) {
    mb.window.setSize(396, 646)
    mb.hideWindow()
    setTimeout(() => {
      mb.showWindow()
    }, 5)
  }
})
//1.3.2
const electron = require('electron')
const menubar = require('menubar')
const url = require('url')
const fs = require('fs')
const AutoLaunch = require('auto-launch')
const updater = require('./Updater/index.js')
const path = require('path')
const settings = require('electron-settings')
const { ipcMain } = require('electron')
const osLocale = require('os-locale')

const BrowserWindow = electron.BrowserWindow
const Tray = electron.Tray

let settingsWin
let Overlay

let iconPath

if (settings.get('DevMod') == true) {
  require('electron-debug')({ enabled: true })
}

if (require('electron-squirrel-startup')) return

if (osLocale.sync().indexOf('fr_FR') > -1 || osLocale.sync().indexOf('fr_BE') > -1 || osLocale.sync().indexOf('fr_CA') > -1) {
  var lang = require('./assets/lang/fr.js')
} else if (osLocale.sync().indexOf('en_US') > -1 || osLocale.sync().indexOf('en_EN') > -1) {
  var lang = require('./assets/lang/en.js')
} else {
  var lang = require('./assets/lang/en.js')
}

if (settings.get('ShuttleAutoLauncher') == true) {
  var ShuttleAutoLauncher = new AutoLaunch({
    name: 'Shuttle',
  })
  //ShuttleAutoLauncher.enable();
}

updater.updateAndInstall()

if (process.platform == 'darwin' || process.platform == 'linux') {
  iconPath = __dirname + '/assets/img/icon.png'
} else if (process.platform == 'win32') {
  iconPath = __dirname + '/assets/img/icon.ico'
}
console.log(iconPath)
var mb = menubar({
  index: 'file://' + __dirname + '/index.html',
  tooltip: 'Shuttle',
  icon: iconPath,
  width: 360,
  height: 640,
  resizable: false,
  title: 'Shuttle',
  preloadWindow: true,
  autoHideMenuBar: true,
  alwaysOnTop: settings.get('SOpen'),
  frame: false,
  skipTaskbar: true
})

//We create the context menu
const contextMenu = electron.Menu.buildFromTemplate([
  {
    label: lang.menu_about,
    click () {
      //We open the website at about
      electron.shell.openExternal('https://getshuttle.xyz/')
    }
  },
  {
    label: lang.menu_settings,
    click () {
      createSettingsWindows()
    }
  },
  { type: 'separator' },
  {
    label: lang.menu_quit,
    click () {
      mb.app.quit()
      console.log('stopping')
    }
  }

])

mb.on('ready', function () {
  console.log('Shuttle is ready')
  if (process.platform == 'win32') {
    mb.tray.setContextMenu(contextMenu)
  }
})

function createSettingsWindows () {
  settingsWin = new BrowserWindow({
    icon: __dirname + '/assets/img/icon.ico',
    width: 300,
    height: 400,
    resizable: false,
    title: 'Settings',
    preloadWindow: true,
    frame: false,
    alwaysOnTop: true
  })

  settingsWin.loadURL(url.format({
    pathname: path.join(__dirname, '/settings/index.html'),
    protocol: 'file:',
    slashes: true
  }))
}

function createOverlay () {
  Overlay = new BrowserWindow({
    width: 40,
    height: 40,
    resizable: false,
    title: 'Overlay',
    preloadWindow: true,
    frame: false,
    skipTaskbar: true,
    show: false,
    transparent: true,
    x: mb.tray.getBounds().x + 130,
    y: mb.tray.getBounds().y - 70,
    alwaysOnTop: true
  })

  Overlay.loadURL(url.format({
    pathname: path.join(__dirname, '/overlay/index.html'),
    protocol: 'file:',
    slashes: true
  }))
}

//right click menu for Tray
mb.on('after-create-window', function () {
//	createOverlay()

//	electron.globalShortcut.register('Shift+S', () => {
//		if (settings.get('OverlayIsActive') == true) {
//			settings.set('OverlayIsActive', false);
//			Overlay.minimize();
//		} else if (settings.get('OverlayIsActive') == false) {
//			settings.set('OverlayIsActive', true);
//			Overlay.show();	
//		}
//	})

  mb.tray.setContextMenu(contextMenu)
  mb.tray.on('right-click', () => {
    mb.tray.popUpContextMenu(contextMenu)
  })
})

var handleStartupEvent = function () {
  if (process.platform !== 'win32') {
    return false
  }

  var squirrelCommand = process.argv[1]
  switch (squirrelCommand) {
    case '--squirrel-install':
    case '--squirrel-updated':

      // Optionally do things such as:
      //
      // - Install desktop and start menu shortcuts
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Always quit when done
      app.quit()

      return true
    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Always quit when done
      app.quit()

      return true
    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated
      app.quit()
      return true
  }
}

if (handleStartupEvent()) {
  return
}

ipcMain.on('SettingSetAlwaysOnTop', (event, arg) => {
  mb.setOption('alwaysOnTop', arg)
  mb.hideWindow()
  console.log(arg)
})

ipcMain.on('SettingSetFrame', (event, arg) => {
  mb.window.webContents.send('addframe', arg)
  if (arg == true) {
    mb.setOption('with', 380)
  }
})

ipcMain.on('OpenDevTool', (event, arg) => {
  mb.window.openDevTools()
})

ipcMain.on('OpenReportWindow', (event, arg) => {
  electron.shell.openExternal('mailto:support@getshuttle.xyz?subject=[BUG SHUTTLE]')
})


if (settings.get('Frame') == true) {
  mb.setOption('with', 380)
} else if (settings.get('Frame') == false) {
  mb.setOption('with', 360)
}

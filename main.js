const {Menu, ipcMain, app, net, shell} = require('electron')
const lowdb = require('lowdb')
const menubar = require('menubar')
const winston = require('winston')
const AutoLaunch = require('auto-launch')
const osLocale = require('os-locale')
const electronLocalshortcut = require('electron-localshortcut');
if(require('electron-squirrel-startup')) return;

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

if (os === "win32") {
  iconPath = `${__dirname}/assets/img/icon.ico`
} else if (os === "linux" || os === "darwin") {
  iconPath = `${__dirname}/assets/img/icon.png`
}

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

var handleStartupEvent = function() {
  if (process.platform !== 'win32') {
    return false;
  }

  var squirrelCommand = process.argv[1];
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
      app.quit();

      return true;
    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Always quit when done
      app.quit();

      return true;
    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated
      app.quit();
      return true;
  }
};

if (handleStartupEvent()) {
  return;
}
const {Menu, ipcMain, BrowserWindow, app} = require('electron')
const lowdb = require('lowdb')
const menubar = require('menubar')
const winston = require('winston')
const AutoLaunch = require('auto-launch')

const shuttleUpdater = require(`${__dirname}/app/modules/shuttle-updater.js`)

winston.add(winston.transports.File, { filename: `${__dirname}/app/logs/Latest.log` })

winston.info('Lauch app')

// Lowdb db init
const FileSync = require('lowdb/adapters/FileSync')
const LowdbAdapterSettings = new FileSync(`${app.getPath('userData')}/settings.json`)
const settings = lowdb(LowdbAdapterSettings)

// Autolaunch init
let ShuttleAutoLauncher = new AutoLaunch({
  name: 'Shuttle',
});

if (settings.get('settings.autostart').value() === true || settings.get('settings.autostart').value() === undefined) {
  ShuttleAutoLauncher.enable();
} else {
  ShuttleAutoLauncher.disable();
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

ipcMain.on('SettingSetAlwaysOnTop', (event, arg) => {
  mb.setOption('alwaysOnTop', arg);
  mb.hideWindow();
})
ipcMain.on('SettingShowFrame', (event, arg) => {
  mb.window.webContents.send('addframe' , arg);
  console.log(arg);
})
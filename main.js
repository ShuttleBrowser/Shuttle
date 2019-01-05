// Import libs
const { app, shell, ipcMain, Notification, globalShortcut, clipboard } = require('electron')
const menubar = require('menubar')
const AutoLaunch = require('auto-launch')
const electronLocalshortcut = require('@beaker/electron-localshortcut')

require('./main/events.js')
const contextMenu = require('./main/menu.js')
const autoUpdater = require('./main/updater.js')
const files = require('./app/modules/files.js')

let normalBound
let fullscreenBounds

let ShuttleAutoLauncher = new AutoLaunch({
  name: 'Shuttle'
})

if (files.settings.getValue('settings.autostart') === true || files.settings.getValue('settings.autostart') === undefined) {  
  ShuttleAutoLauncher.enable()
} else {
  ShuttleAutoLauncher.disable()
}

let screen
let mb

const shuttle = {
  // create window
  createAppWindows () {
    mb = new menubar({
      icon: require.resolve(`./main/icon.png`),
      index: `file://${__dirname}/app/index.html`,
      width: 395,
      minWidth: 395,
      height: 645,
      minHeight: 645,
      title: 'Shuttle',
      autoHideMenuBar: true,
      frame: false,
      skipTaskbar: true,
      backgroundColor: '#ffffff',
      preloadWindow: true,
      alwaysOnTop: files.settings.getValue('settings.StayOpen') || false,
      resizable: false,
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
  mb.window.setMenu(null)
  mb.showWindow()

  screen = require('electron').screen.getPrimaryDisplay()
  fullscreenBounds = {
    x: 0,
    y: 0,
    width: screen.size.width,
    height: screen.size.height
  }
  normalBounds = {
  	x: mb.window.getBounds().x,
  	y: mb.window.getBounds().y,
    width: 395,
    height: 645
  }

  app.on('before-quit', () => {
    mb.tray.Destroy()
    electronLocalshortcut.unregisterAll()
    mb.window.removeAllListeners('close')
    mb.window.close()
  })
  
  mb.window.on('move', () => {
    if(mb.window.getBounds().x != 0) {
      normalBounds.x = mb.window.getBounds().x
      normalBounds.y = mb.window.getBounds().y
    }
  })

  globalShortcut.register('CmdOrCtrl+Shift+X', () => {
    if (mb.window.isVisible()) {
      mb.hideWindow()
    } else {
      mb.showWindow()
    }
  })

  electronLocalshortcut.register(mb.window, 'Escape', () => {
    if(mb.window.isFullScreen()) {
      mb.window.webContents.send('SHORTCUT_QUIT_FULLSCREEN')
    }
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+P', () => {
    mb.window.webContents.send('SHORTCUT_ADD_BOOKMARK')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+H', () => {
    mb.window.webContents.send('SHORTCUT_SHOW_MAIN')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+S', () => {
    mb.window.webContents.send('SHORTCUT_SHOW_SETTING')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+K', () => {
    mb.window.webContents.send('SHORTCUT_SHOW_QUICKSERACH')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+S', () => {
    mb.window.webContents.send('SHORTCUT_MAKE_SCREENSHOT')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+R', () => {
    mb.window.webContents.send('SHORTCUT_REMOVE_BOOKMARK')
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+Alt+I', () => {
    mb.window.openDevTools()
  })

  electronLocalshortcut.register(mb.window, 'F5', () => {
    mb.window.webContents.send('SHORTCUT_REFRESH_CURRENTPAGE');
  })

  electronLocalshortcut.register(mb.window, 'Alt+Left', () => {
    mb.window.webContents.send('SHORTCUT_GOBACKINHISTORY');
  })

  electronLocalshortcut.register(mb.window, 'Alt+Right', () => {
    mb.window.webContents.send('SHORTCUT_GOFORWARDINHISTORY');
  })

  electronLocalshortcut.register(mb.window, 'CmdOrCtrl+Shift+I', () => {
    mb.window.webContents.send('SHORTCUT_OPENWEBVIEWDEVTOOLS');
  })
})

EventsEmitter.on('SHOW_SHUTTLE', () => {
  mb.showWindow()
})

EventsEmitter.on('SHOW_ABOUT', () => {
  shell.openExternal('https://shuttleapp.io/about')
})

EventsEmitter.on('SHOW_SETTINGS', () => {
  mb.window.webContents.send('SHORTCUT_SHOW_SETTING')
})

EventsEmitter.on('QUIT_SHUTTLE', () => {
  app.quit()
})

ipcMain.on('WEB_NOTIFICATION', (event, data) => {
  let notif = new Notification(data.title, {
    body: data.text
  })

  notif.onclick = () => {
    console.log('Notification clicked')
  }

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

<<<<<<< HEAD
ipcMain.on('SET_FULLSCREEN', (event, bool) => {
=======
ipcMain.on('SetBounds', (event, bool) => {
  mb.window.setFullScreen(bool)
>>>>>>> 9e0cfe54a3797363b264a9894e0c30ba206eefe6
  if (bool) {
    mb.setOption('fullscreen', true)
    console.log('show fullscreen')
  } else {
    mb.setOption('fullscreen', false)
    console.log('quit fullscreen')
  }
})

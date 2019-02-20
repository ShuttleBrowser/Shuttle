// Import libs
const fs = require('fs')

let appPath

if (process.type === 'renderer') {
  appPath = require('electron').remote.app
} else {
  appPath = require('electron').app
}

const userData = appPath.getPath('userData')
const settingsFilePath = `${userData}/settings.json`
const bookamrksFilePath = `${userData}/bookmarks.json`
const modulesFilePath = `${userData}/modules.json`
const applicationsFilePath = `${userData}/applications.json`

const checkSettings = (callback) => {
  fs.exists(settingsFilePath, (exist) => {
    if (exist === false) {

      fs.writeFile(settingsFilePath, '', (err) => {
        if (err) throw err
        console.log('[FILES] > creating settings.json')
        fs.writeFile(bookamrksFilePath, '', (err) => {
          if (err) throw err
          console.log('[FILES] > creating bookmarks.json')
          fs.writeFile(modulesFilePath, '', (err) => {
            if (err) throw err
            console.log('[FILES] > creating modules.json')
            fs.writeFile(applicationsFilePath, '', (err) => {
              if (err) throw err
              console.log('[FILES] > creating applications.json')
              callback()
            })
          })
        })
      })

    } else {
      console.log('[FILES] > Settings dir alreay exist')
      callback()
    }
  })
}

  let files

  const { app, shell, ipcMain, Notification, globalShortcut, clipboard } = require('electron')
  const menubar = require('menubar')
  const AutoLaunch = require('auto-launch')
  const electronLocalshortcut = require('@beaker/electron-localshortcut')
  
  require('./main/events.js')
  const autoUpdater = require('./main/updater.js')
  
  let normalBound
  let fullscreenBounds
  let ShuttleAutoLauncher

  app.requestSingleInstanceLock()
  

  let screen
  let mb
  
  const shuttle = {
    initApp () {
      return new Promise((resolve) => {
        checkSettings(() => {
          files = require('./app/modules/files.js')
  
          ShuttleAutoLauncher = new AutoLaunch({
            name: 'Shuttle'
          })
    
          if (files.settings.getValue('settings.autostart') === true || files.settings.getValue('settings.autostart') === undefined) {  
            ShuttleAutoLauncher.enable()
          } else {
            ShuttleAutoLauncher.disable()
          }
  
          shuttle.createAppWindow()
        })
      })
    },

    // create window
    createAppWindow () {
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
        contextIsolation: false,
        nodeIntegration: true,
        webPreferences: {
          webSecurity: false,
          'overlay-fullscreen-video': true,
          webaudio: true,
          webgl: true,
          textAreasAreResizable: true
        }
      })

      mb.tray.setContextMenu(require('./main/menu.js'))
      mb.window.setMenu(null)

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
    }
  }
  
  app.on('ready', () => {
    shuttle.initApp().then(() => {
      console.log('App initialized')
    })
  
    app.on('before-quit', () => {
      mb.tray.Destroy()
      electronLocalshortcut.unregisterAll()
      mb.window.removeAllListeners('close')
      mb.window.close()
    })

    globalShortcut.register('CmdOrCtrl+Shift+X', () => {
      if (mb.window.isVisible()) {
        mb.hideWindow()
      } else {
        mb.showWindow()
      }
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
  
  ipcMain.on('SetBounds', (event, bool) => {
    mb.window.setFullScreen(bool)
    if (bool) {
      mb.setOption('fullscreen', true)
      console.log('show fullscreen')
    } else {
      mb.setOption('fullscreen', false)
      console.log('quit fullscreen')
    }
  })
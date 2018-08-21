'use strict'

import { app } from 'electron'
import menubar from 'menubar'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  mainWindow = menubar({
    icon: '/static/icon/icon.png',
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
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      webSecurity: false,
      'overlay-fullscreen-video': true,
      webaudio: true,
      webgl: true,
      textAreasAreResizable: true
    }
  })

  mainWindow.window.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

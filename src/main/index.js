'use strict'

import { app, Menu } from 'electron'
import menubar from 'menubar'
import { resolve } from 'path'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let iconPath

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

if (process.platform === 'darwin' || process.platform === 'linux') {
  iconPath = resolve('build/icons/icon.png')
} else if (process.platform === 'win32') {
  iconPath = resolve('build/icons/icon.ico')
}

const contextMenu = Menu.buildFromTemplate([
  {label: 'Show shuttle'},
  {label: 'About'},
  {label: 'Settings'},
  {type: 'separator'},
  {label: 'Quit'}
])

function createWindow () {
  mainWindow = menubar({
    icon: iconPath,
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

  mainWindow.tray.setContextMenu(contextMenu)
  mainWindow.tray.on('right-click', () => { mainWindow.tray.popUpContextMenu(contextMenu) })
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

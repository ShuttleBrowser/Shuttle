const electron = require('electron')
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
const contextMenu = electron.Menu.buildFromTemplate([

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
      winston.info('Comming soon!')
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

  // qui btn :(
  {
    label: 'Quit',
    click () {
      console.log('Goodbye !')
      mb.app.quit()
    }
  }

])

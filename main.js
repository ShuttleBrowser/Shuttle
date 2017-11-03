'use strict';
const electron = require('electron');
const menubar = require('menubar');
const url = require('url');
const fs = require('fs');
const updater = require('electron-simple-updater');
const AutoLaunch = require('auto-launch');

require('electron-debug')({enabled: true});

updater.init({
  checkUpdateOnStart: true,
  autoDownload: true,
  url: 'update.getshuttle.xyz',
  disabled: false
});

var mb = menubar({
  index: "file://" + __dirname + "/index.html",
  tooltip: "Shuttle",
  icon:__dirname + "/assets/img/logo.png",
  width:360,
  height:640,
  resizable: false
});

//We create the context menu
const contextMenu = electron.Menu.buildFromTemplate([
  {
    label: 'About',
    click() {
    //We open the website at about
      electron.shell.openExternal('https://getshuttle.xyz/about')
    }
  },
  {
    label: 'Updates',
    click() {
      updater.checkForUpdates();
        function onUpdateAvailable(meta) {
	        updater.downloadUpdate();
      }
    }
  },
  {type: 'separator'},
  {
    label: 'Quit',
    click() {
      mb.app.quit();
      console.log('stopping');
    }
  }

]);

mb.on('ready', function () {
  console.log('Shuttle is ready');
  if (process.platform == 'win32') {
    mb.tray.setContextMenu(contextMenu);
  }
});
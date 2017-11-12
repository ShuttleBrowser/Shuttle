'use strict';
const electron = require('electron');
const menubar = require('menubar');
const url = require('url');
const fs = require('fs');
const AutoLaunch = require('auto-launch');
const update = require("./Updater/Updater.js");

require('electron-debug')({enabled: true});

update.updateAndInstall();

var ShuttleAutoLauncher = new AutoLaunch({
    name: 'Shuttle',
});

ShuttleAutoLauncher.enable();

var mb = menubar({
  index: "file://" + __dirname + "/index.html",
  tooltip: "Shuttle",
  icon:__dirname + "/assets/img/icon.ico",
  width:360,
  height:640,
  resizable: false,
  title: "Shuttle"
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
    	 update.updateAndInstall();
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
//1.0.3
'use strict';
const electron = require('electron');
const menubar = require('menubar');
const url = require('url');
const fs = require('fs');
const AutoLaunch = require('auto-launch');
const updater = require('./updater/index.js');
const path = require("path");
const settings = require("electron-settings");

const BrowserWindow = electron.BrowserWindow;
const Tray = electron.Tray;

let settingsWin;

require('electron-debug')({enabled: true});

if (settings.get('ShuttleAutoLauncher') == true) {
	var ShuttleAutoLauncher = new AutoLaunch({
	    name: 'Shuttle',
	});

	ShuttleAutoLauncher.enable();
}

updater.updateAndInstall();

if (settings.get('SOpen') == true) {
	var mb = menubar({
	  index: "file://" + __dirname + "/index.html",
	  tooltip: "Shuttle",
	  icon:__dirname + "/assets/img/icon.ico",
	  width:360,
	  height:640,
	  resizable: false,
	  title: "Shuttle",
	  preloadWindow: true,
	  showDockIcon: false,
	  alwaysOnTop: true
	});
} else {
	var mb = menubar({
	  index: "file://" + __dirname + "/index.html",
	  tooltip: "Shuttle",
	  icon:__dirname + "/assets/img/icon.ico",
	  width:360,
	  height:640,
	  resizable: false,
	  title: "Shuttle",
	  preloadWindow: true,
	  showDockIcon: false
	});	
}


//We create the context menu
const contextMenu = electron.Menu.buildFromTemplate([
  {
    label: 'About',
    click() {
    //We open the website at about
      electron.shell.openExternal('https://getshuttle.xyz/')
    }
  },
  {
    label: 'Settings',
    click() {
        createSettingsWindows();
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

function createSettingsWindows() {
  settingsWin = new BrowserWindow({
	icon:__dirname + "/assets/img/icon.ico",
    width: 300,
    height: 400,
    resizable: false,
    title: "Settings",
    preloadWindow: true,
    frame: false
  });

  settingsWin.loadURL(url.format({
    pathname: path.join(__dirname, '/settings/index.html'),
    protocol: 'file:',
    slashes: true
  }));
}
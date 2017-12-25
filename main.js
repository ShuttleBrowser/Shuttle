//1.1.1.0
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
if(require('electron-squirrel-startup')) return;

if (settings.get('ShuttleAutoLauncher') == true) {
	var ShuttleAutoLauncher = new AutoLaunch({
	    name: 'Shuttle',
	});

	ShuttleAutoLauncher.enable();
}

updater.updateAndInstall();
  var iconPath = __dirname + "/assets/img/icon.ico";
  if (process.platform == 'darwin')
    iconPath = "file://" + __dirname + "/assets/img/icon.ico";

	var mb = menubar({
	  index: "file://" + __dirname + "/index.html",
	  tooltip: "Shuttle",
    icon: iconPath,
	  width:360,
	  height:640,
	  resizable: false,
	  title: "Shuttle",
	  preloadWindow: true,
    autoHideMenuBar: true,
	  alwaysOnTop: settings.get('SOpen'),
    frame: settings.get('Frame')
  });

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

//right click menu for Tray
mb.on('after-create-window', function () {
  mb.tray.on('right-click', () => {
    mb.tray.popUpContextMenu(contextMenu);
  })
});

mb.on( 'ready', () => app.setAppUserModelId('xyz.ShuttleLtd.Shuttle'))

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

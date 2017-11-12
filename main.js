'use strict';
const electron = require('electron');
const menubar = require('menubar');
const url = require('url');
const fs = require('fs');
const AutoLaunch = require('auto-launch');
const update = require(__dirname+"/Updater/Updater.js");

if (require('electron-squirrel-startup')) return;
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


if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else 
  return;
}
 
function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }
 
  const ChildProcess = require('child_process');
  const path = require('path');
 
  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);
 
  const spawn = function(command, args) {
    let spawnedProcess, error;
 
    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}
 
    return spawnedProcess;
  };
 
  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };
 
  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as: 
      // - Add your .exe to the PATH 
      // - Write to the registry for things like file associations and 
      //   explorer context menus 
 
      // Install desktop and start menu shortcuts 
      spawnUpdate(['--createShortcut', exeName]);
 
      setTimeout(amb.pp.quit, 1000);
      return true;
 
    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and 
      // --squirrel-updated handlers 
 
      // Remove desktop and start menu shortcuts 
      spawnUpdate(['--removeShortcut', exeName]);
 
      setTimeout(mb.app.quit, 1000);
      return true;
 
    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before 
      // we update to the new version - it's the opposite of 
      // --squirrel-updated 
 
      mb.app.quit();
      return true;
  }
};
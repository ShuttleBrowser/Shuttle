const {ipcRenderer, remote} = require('electron')
const {app} = require('electron').remote;
const fs = require('fs');
const winston = require('winston')
const AutoLaunch = require('auto-launch')

require('../assets/js/FileSaver.js')

const lowdb = require('lowdb')

// Lowdb db init
const FileSync = require('lowdb/adapters/FileSync')
const LowdbAdapter = new FileSync(`${app.getPath('userData')}/settings.json`)
const db = lowdb(LowdbAdapter)

// all checkbox
const checkboxAutoStart = document.querySelector('input[name=SAboot]')
const checkboxStayOpen = document.querySelector('input[name=SOpen]')
const checkboxShowFrame = document.querySelector('input[name=SFrame]')
// dev mode
const checkboxDevMode = document.querySelector('input[name=DevMod]')

// all buttons
const downloadButton = document.querySelector('input[name=download]') 
const uploadButton = document.querySelector('input[name=upload]') 
const resetButton = document.querySelector('input[name=reset]') 
//dev mode
const showConsoleButton = document.querySelector('input[name=ShowConsole]')
const reportBugButton = document.querySelector('input[name=report]')

let ShuttleAutoLauncher = new AutoLaunch({
  name: 'Shuttle',
});

// Checkbox for Autostart option
checkboxAutoStart.addEventListener('change', () => {
  if (checkboxAutoStart.checked) {
    db.set('settings.autostart', true).write()
    ShuttleAutoLauncher.enable();
    console.log(`Autostart: ${checkboxAutoStart.checked}`)
  } else {
    db.set('settings.autostart', false).write()
    ShuttleAutoLauncher.disable();
    console.log(`Autostart: ${checkboxAutoStart.checked}`)
  }
})

// Checkbox for Stay open option
checkboxStayOpen.addEventListener('change', () => {
  db.set('settings.StayOpen', checkboxStayOpen.checked).write()
  ipcRenderer.send('SettingSetAlwaysOnTop', checkboxStayOpen.checked)
  console.log(`StayOpen: ${checkboxStayOpen.checked}`)
})

// Checkbox for frame option
checkboxShowFrame.addEventListener('change', () => {
  db.set('settings.ShowFrame', checkboxShowFrame.checked).write()
  ipcRenderer.send('SettingShowFrame', checkboxShowFrame.checked)
  console.log(`ShowFrame: ${checkboxShowFrame.checked}`)
})

// Checkbox for Dev mode
checkboxDevMode.addEventListener('change', () => {
  if (checkboxDevMode.checked) {  
    showConsoleButton.disabled = false;
    reportBugButton.disabled = false;
    db.set('settings.DevMode', true).write()
    console.log(`DevMode: ${checkboxDevMode.checked}`)
  } else {
    showConsoleButton.disabled = true;
    reportBugButton.disabled = true;
    db.set('settings.DevMode', false).write()
    console.log(`DevMode: ${checkboxDevMode.checked}`)
  }
})

//////////// BUTTONS ////////////

// Button for export (dowload) the bookmarks
downloadButton.addEventListener('click', () => {
  console.log(`download button is clicked`)
  settings.downloadFavorites()
})

// Button for import (upload) the bookmarks
uploadButton.addEventListener('click', () => {
  console.log(`upload button is clicked`)
  settings.uploadFavorites()
})

// Button for reset the bookmarks
resetButton.addEventListener('click', () => {
  console.log(`reset button is clicked`)
  settings.resetFavorites()
})

// Button for show developper console
showConsoleButton.addEventListener('click', () => {
  console.log(`Show console button is clicked`)
  remote.getCurrentWindow().openDevTools()
})

// Button for report a bug
reportBugButton.addEventListener('click', () => {
  console.log(`report bug button is clicked`)
  remote.shell.openExternal('mailto:support@getshuttle.xyz?subject=[BUG SHUTTLE]');
})

// Settings loading
if ( db.get('settings.autostart').value() === true || db.get('settings.autostart').value() === undefined ) { checkboxAutoStart.checked = true }
if ( db.get('settings.StayOpen').value() === true ) { checkboxStayOpen.checked = true }
if ( db.get('settings.ShowFrame').value() === true ) { checkboxShowFrame.checked = true }
if ( db.get('settings.DevMode').value() === true ) {
  checkboxDevMode.checked = true
  showConsoleButton.disabled = false;
  reportBugButton.disabled = false;
} else if ( db.get('settings.DevMode').value() === false || db.get('settings.DevMode').value() === undefined ) {
  showConsoleButton.disabled = true;
  reportBugButton.disabled = true;
}

// All functiion for settings
const settings = {
  downloadFavorites: () => {
    let data = fs.readFileSync(`${app.getPath('userData')}/db.json`,'utf8');
    let fileToSave = new Blob([data], {
        type: 'application/json',
        name: "data.shtd"
    });
    saveAs(fileToSave, "data.shtd");
  },

  uploadFavorites: () => {
    remote.dialog.showOpenDialog({filters: [{name: 'Shuttle data', extensions: ['shtd']}]}, function (fileNames) { 
       if(fileNames === undefined) { 
          console.log("No file selected"); 
       } else { 
         console.log(fileNames[0]);
         fs.createReadStream(fileNames[0]).pipe(fs.createWriteStream(`${app.getPath('userData')}/db.json`));
       } 
    });
 },

  resetFavorites: () => {
    let choice = remote.dialog.showMessageBox({
      type: 'question',
      buttons: ["Yes", "No"],
      title: 'Reset',
      message: 'Reset all bookmarks ?'
    });
    if (choice == 0) {
      console.log('Reset...');
      fs.writeFile(`${app.getPath('userData')}/db.json`, '', function (err) {
        if (err) {
          return console.log(err);
        } 
      });
    }
  }

}
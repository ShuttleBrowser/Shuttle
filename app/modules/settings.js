const {ipcRenderer, remote} = require('electron')
const {app} = require('electron').remote;
const fs = require('fs');
const winston = require('winston')
const AutoLaunch = require('auto-launch')
const locationMsg = require(`${__dirname}/../app/modules/lang.js`)

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

// all buttons
const downloadButton = document.querySelector('input[name=download]') 
const uploadButton = document.querySelector('input[name=upload]') 
const resetButton = document.querySelector('input[name=reset]') 
//advanced mode
const showConsoleButton = document.querySelector('input[name=ShowConsole]')
const reportBugButton = document.querySelector('input[name=report]')
const clearCacheButton = document.querySelector('input[name=ccache]')

// text
document.querySelector('#SAboot').innerHTML = locationMsg('settings_StartAtBoot')
document.querySelector('#SOpen').innerHTML = locationMsg('settings_StayOpen')
document.querySelector('#SFrame').innerHTML = locationMsg('settings_ShowFrame')

document.querySelector('#bkms').innerHTML = locationMsg('bookmarks')
document.querySelector('#Export').innerHTML = locationMsg('settings_ExportBokmarks')
document.querySelector('#Import').innerHTML = locationMsg('settings_importBokmarks')
document.querySelector('#Reset').innerHTML = locationMsg('settings_ResetBookmarks')

document.querySelector('#devtitle').innerHTML = locationMsg('advanced')
document.querySelector('#shcons').innerHTML = locationMsg('settings_ShowConsole')
document.querySelector('#ccache').innerHTML = locationMsg('settings_ReportBug')
document.querySelector('#rep').innerHTML = locationMsg('settings_ClearCache')




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

clearCacheButton.addEventListener('click', () => {
  console.log(`clear cache button is clicked`)
  let win = remote.getCurrentWindow();
  win.webContents.session.clearCache(() => {
    console.log('cache is cleared')
  });
})

// Settings loading
if ( db.get('settings.autostart').value() === true || db.get('settings.autostart').value() === undefined ) { checkboxAutoStart.checked = true }
if ( db.get('settings.StayOpen').value() === true ) { checkboxStayOpen.checked = true }
if ( db.get('settings.ShowFrame').value() === true ) { checkboxShowFrame.checked = true }

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
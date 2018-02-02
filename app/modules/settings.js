const {ipcRenderer, remote} = require('electron')
const {app} = require('electron').remote;
const fs = require('fs');
const winston = require('winston')

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

// Checkbox for Autostart option
checkboxAutoStart.addEventListener('change', () => {
  if (this.checked) {
    db.set('settings.autostart', true).write()
    console.log(`Autostart: ${this.checked}`)
  } else {
    db.set('settings.autostart', false).write()
    console.log(`Autostart: ${this.checked}`)
  }
})

// Checkbox for Stay open option
checkboxStayOpen.addEventListener('change', () => {
  if (this.checked) {
    db.set('settings.StayOpen', true).write()
    console.log(`StayOpen: ${this.checked}`)
  } else {
    db.set('settings.StayOpen', false).write()
    console.log(`StayOpen: ${this.checked}`)
  }
})

// Checkbox for frame option
checkboxShowFrame.addEventListener('change', () => {
  if (this.checked) {
    db.set('settings.ShowFrame', true).write()
    console.log(`ShowFrame: ${this.checked}`)
  } else {
    db.set('settings.ShowFrame', false).write()
    console.log(`ShowFrame: ${this.checked}`)
  }
})

// Checkbox for Dev mode
checkboxDevMode.addEventListener('change', () => {
  if (this.checked) {
    db.set('settings.ShowFrame', true).write()
    console.log(`DevMode: ${this.checked}`)
  } else {
    db.set('settings.ShowFrame', false).write()
    console.log(`DevMode: ${this.checked}`)
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
})

// Button for reset the bookmarks
resetButton.addEventListener('click', () => {
  console.log(`reset button is clicked`)
})

// Button for show developper console
showConsoleButton.addEventListener('click', () => {
  console.log(`Show console button is clicked`)
  remote.getCurrentWindow().openDevTools()
})

// Button for report a bug
reportBugButton.addEventListener('click', () => {
  console.log(`report bug button is clicked`)
})

// All functiion for settings
const settings = {
  downloadFavorites: () => {
    var data = fs.readFileSync(`${app.getPath('userData')}/db.json`,'utf8');
    var fileToSave = new Blob([data], {
        type: 'application/json',
        name: "data.shtd"
    });
    saveAs(fileToSave, "data.shtd");
  }
}
const low = require('lowdb')
const {ipcRenderer, remote} = require('electron')
const winston = require('winston')

// lowdb
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('../settings.json')
const db = low(adapter)

let startAtBoot = document.querySelector('input[name=SOpen]')

startAtBoot.addEventListener('change', () => {
  if (this.checked) {
        // Checkbox is checked..
  } else {
        // Checkbox is not checked..
  }
})

document.querySelector('.close').addEventListener('click', (e) => {
  let window = remote.getCurrentWindow()
  window.close()
})

const electron = require('electron')
const ipcRenderer = electron.ipcRenderer

const { settings } = require('./files.js')

let Notification = (title, ops) => {
  let text = ops.body

  ipcRenderer.send('WEB_NOTIFICATION', {
    title: title,
    text: text
  })
}

window.__appPath = window.location.href.replace('/index.html', '')
window.app = {

  uuid: document.location.search.replace('?uuid=', ''),

  settings: {
    set (key, value) {
      ipcRenderer.sendToHost('SAVE_SETTINGS', {
        key: `settings.addon.${app.uuid}.${key}`,
        value: value
      })
    },
  
    async get (key) {
      ipcRenderer.send('GET_SETTINGS', `settings.addon.${app.uuid}.${key}`)
      await ipcRenderer.on('GET_SETTINGS_RESPONSE', (event, data) => {
        console.log(data)
      })
    },
  },

  bookmarks: {
    add (id, icon, url, type) {
      ipcRenderer.sendToHost('ADD_NEW_BOOKMARK', {
        id: id,
        icon: icon,
        url: url,
        type: type
      })
    },

    remove (id, type) {
      ipcRenderer.sendToHost('REMOVE_BOOKMARK', {
        id: id,
        type: type
      })
    }
  }

}

Notification.permission = false 

Notification.requestPermission = () => {
  return new Promise((resolve) => {
    Notification.permission = true
    resolve()
  })
}

window.Notification = Notification

window.goHome = () => {
  ipcRenderer.sendToHost('GO_HOME', window.location)
}

window.alert = (message) => {
  ipcRenderer.sendToHost('PAGE_ALERT', {site: document.title, message: message})
}

window.openTab = (search) => {
  ipcRenderer.sendToHost('OPEN_QUICK_SEARCH', search)
}

window.copyToClipboard = (url) => {
  ipcRenderer.sendToHost('COPY_TO_CLIPBOARD', url)
}
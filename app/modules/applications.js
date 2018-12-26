const electron = require('electron')
const ipcRenderer = electron.ipcRenderer

let Notification = (title, ops) => {
  let text = ops.body

  ipcRenderer.send('WEB_NOTIFICATION', {
    title: title,
    text: text
  })
}

Notification.permission = false 

Notification.requestPermission = () => {
  return new Promise((resolve) => {
    Notification.permission = true
    resolve()
  })
}

window.Notification = Notification
window.__appPath = window.location.href.replace('/index.html', '')

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
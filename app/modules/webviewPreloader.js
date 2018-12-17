const electron = require('electron')
const Menu = electron.remote.Menu
const ipcRenderer = electron.ipcRenderer

let Notification = function (title, ops) {
  let imgURL = `${window.location.origin}/${ops.icon}`
  let text = ops.body

  ipcRenderer.send('notif', {
    title: title,
    text: text,
    imgURL: imgURL
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
window.alert = (message) => {
  ipcRenderer.sendToHost('PAGE_ALERT', {site: document.title, message: message})
}

window.openTab = (search) => {
  ipcRenderer.sendToHost('OPEN_QUICK_SEARCH', search)
}

document.addEventListener('contextmenu', (event) => {
  if (event.target.href) {
    event.preventDefault()
    
    Menu.buildFromTemplate([
      {
        label: 'Open in quick search',
        click() {
          openTab(event.target.href)
        },
      }
    ]).popup(require('electron').remote.getCurrentWindow())
  }
})
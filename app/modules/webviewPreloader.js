const { ipcRenderer } = require('electron')

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
  ipcRenderer.send('PAGE_ALERT', {message: message})
}
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

window.copyToClipboard = (url) => {
  ipcRenderer.sendToHost('COPY_TO_CLIPBOARD', url)
}

window.openInBrowser = (url) => {
  ipcRenderer.sendToHost('OPEN_IN_BROWSER', url);
}

window.switchVersion = () => {
  ipcRenderer.sendToHost('SWITCH_VERSION');
}

window.getSelectionText = () => {
  let text = ''
  if (window.getSelection) {
      text = window.getSelection().toString()
  }
  return text
}

document.addEventListener('contextmenu', (event) => {
  e = event.target
  const html = document.querySelector('html')
  let img = undefined, a = undefined
  while(e != html && a == undefined) {
    if(e.tagName == "IMG") {
      img = e
    } else if(e.tagName == "A") {
      a = e
    }
    e = e.parentElement
  }

  let items = [{
    label: 'Switch to mobile/desktop version',
    click() {
      // switch to desktop version 
    }
  }]

  let text = getSelectionText()
  if(text !== '') {
    items.push({
      type: 'separator'
    },
    {
      label: 'Copy',
      click() {
        copyToClipboard(text)
      }
    });
  }
  
  if(a !== undefined) {
    event.preventDefault()
    items.push({
      type: 'separator'
    },
    {
      label: 'Open link in quick search',
      click() {
        openTab(a.href)
      },
    },
    {
      label: 'Open link in browser',
      click() {
        openInBrowser(a.href)
    }
    },
    {
      label: 'Copy link',
      click() {
        copyToClipboard(a.href)
      }
    })
  }
  
  if(img !== undefined) {
    items.push({
      type: 'separator'
    },
    {
      label: 'Open picture in browser',
      click() {
        openInBrowser(img.src)
      }
    },
    {
      label: 'Copy picture URL',
      click() {
        copyToClipboard(img.src)
      }
    })
  }
  
  Menu.buildFromTemplate(items).popup(require('electron').remote.getCurrentWindow())
})
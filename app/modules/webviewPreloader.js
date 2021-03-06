let {remote, ipcRenderer} = require('electron')
const Menu = remote.Menu
const lang = require('../../lang/lang')

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

  let items = [];

  let text = getSelectionText()
  if(text !== '') {
    items.push({
      type: 'separator'
    },
    {
      label: lang('COPY_TEXT'),
      click() {
        copyToClipboard(text)
      }
    },
    {
      label: lang('SEARCH_TEXT_QUICKSEARCH'),
      click() {
        openTab(text)
      }
    })
  }
  
  if(a !== undefined) {
    event.preventDefault()
    items.push({
      type: 'separator'
    },
    {
      label: lang('OPEN_LINK_QUICK_SEARCH'),
      click() {
        openTab(a.href)
      },
    },
    {
      label: lang('OPEN_LINK_BROWSER'),
      click() {
        openInBrowser(a.href)
    }
    },
    {
      label: lang('COPY_lINK'),
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
      label: lang('OPEN_PICTURE_BROWSER'),
      click() {
        openInBrowser(img.src)
      }
    },
    {
      label: lang('COPY_PICTURE_URL'),
      click() {
        copyToClipboard(img.src)
      }
    })
  }
  
  if(text === '' && a === undefined && img === undefined) {
    items = [{
      label: lang('SWITCH_WEBSITE_VERSION'),
      click() {
        switchVersion()
      }
    },
    {
      label: lang('COPY_CURRENT_URL'),
      click() {
        copyToClipboard(location.href)
      }
    },
    {
      label: lang('OPEN_IN_BROWSER'),
      click() {
        openInBrowser(location.href)
      }
    }]
  }
  
  Menu.buildFromTemplate(items).popup(remote.getCurrentWebContents())
})
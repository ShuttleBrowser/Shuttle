const electron = require('electron')
const ipcRenderer = electron.ipcRenderer
const path = require('path')

let Notification = (title, ops) => {
  let text = ops.body

  ipcRenderer.send('WEB_NOTIFICATION', {
    title: title,
    text: text
  })
}

window.app = {

  uid: document.location.search.replace('?uid=', ''),

  settings: {
    set (key, value) {
      ipcRenderer.sendToHost('SAVE_SETTINGS', {
        key: `settings.addon.${app.uuid}.${key}`,
        value: value
      })
    },
  
    get (key) {
      return new Promise((resolve) => {
        if (key === 'token' && app.uuid === 'Kwarn') {
          ipcRenderer.sendToHost('GET_SETTINGS', `settings.userToken`)
        } else {
          ipcRenderer.sendToHost('GET_SETTINGS', `settings.addon.${app.uuid}.${key}`)
        }
        ipcRenderer.on('GET_SETTINGS_RESPONSE', (event, data) => {
          resolve(data)
        })
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

String.prototype.replaceAll = (search, replacement) => {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
}

window.__appPath = require('electron').remote.app.getPath('userData').replace(/\\/g,"/") + '/addons/' + app.uid + '/app'

window.require = (id) => {
  if (id.startsWith('./')) {
    if (document.location.protocol === 'file:') {
      id = require('path').join(document.location.pathname.replace('index.html', '').replace(/%20/g, ' '), id).replace(/\\/g,"/").substring(1000, 1)
      console.log(id)
      return module.require(id)
    } else {
      return module.require(path.resolve(`${__appPath}/${id}`))
    }
  } else {
    return module.require(id)
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
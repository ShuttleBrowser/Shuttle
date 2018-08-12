/* global vex Sortable fetch location */

// modules
const fs = require('fs')
const {resolve} = require('path')
const winston = require('winston')
const {remote, ipcRenderer} = require('electron')
const {app} = require('electron').remote
const lowdb = require('lowdb')

const locationMsg = require(`${__dirname}/../app/modules/lang.js`)
const adapter = require(`${__dirname}/../app/modules/adapter.js`)

// Lowdb db init
const FileSync = require('lowdb/adapters/FileSync')
const bookmarksFile = new FileSync(`${app.getPath('userData')}/db.json`)
const settingsFile = new FileSync(`${app.getPath('userData')}/settings.json`)

const db = lowdb(bookmarksFile)
const settings = lowdb(settingsFile)

db.defaults({bookmarks: []}).write()

// init winston
winston.add(winston.transports.File, {filename: `${__dirname}/../app/logs/Latest.log`})

// elements for DOM
const bookmarksBar = document.querySelector('.bkms-bar')
let bookmarkZone = document.querySelector('.bookmarks-zone')
const controlBar = document.querySelector('.control-bar')
// const searchBar = document.querySelector('.search-bar')
const titleBar = document.querySelector('.title-bar')
const view = document.querySelector('webview')
const settingsView = document.querySelector('#settings')

// get the browser window
const browser = remote.getCurrentWindow()

let iconGetter = 'https://besticon.herokuapp.com'

let pcUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
let mobileUserAgent = 'Mozilla/5.0 (Linux; Android 8.0; Pixel XL Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36'
let curentUserAgent = mobileUserAgent

let bookmarks = db.get('bookmarks').value()

// Manage bookmarks' id & makes possible to access a bookmark from its url
let idToUrl = {}
let maxId = 0

// Make possible to load views one at a time, avoiding did-fail-load events
let currentBookmarkId
let currentBookmarkUrl = 'https://changelog.getshuttle.xyz'
let isLoadingAView = false
let nextBookmarkToDisplay

let settingsIsActive
let userAgentIsPc = false

const shuttle = {

  /** Initializes the bookmarks bar with given bookmarks */
  initBookmarks: (bkmarks) => {
    bookmarksBar.innerHTML = ''
    bookmarksBar.innerHTML += `<a href="#" class="shuttle-btn" onclick="shuttle.loadView('http://changelog.getshuttle.xyz')"></a><hr>`
    bookmarksBar.innerHTML += `<div class="bookmarks-zone"><a href="javascript:shuttle.askNewBookAddress()" class="add-btn"></a></div>`
    for (let i in bkmarks) {
      maxId = Math.max(maxId, bkmarks[i].id)
      shuttle.addBookmarkToBar(bkmarks[i].url, bkmarks[i].id)
    }
  },

  radioThisURL: () => {
    document.querySelector('#radioURL').click()
  },

  autofocusInput: () => {
    document.querySelector('#inputURL').focus()
  },

  /** Asks the user the address of the bookmark he wants to add */
  askNewBookAddress: (id = maxId + 1) => {
    let inputs = []
    inputs.push(
      '<div class="vex-custom-field-wrapper">',
      '<div class="vex-custom-radio">',
      '<input type="radio" name="action" checked value="radioURL" id="radioURL" onclick="shuttle.autofocusInput()"><label for="radioURL">' + locationMsg('typeURL') + '</label><br>',
      '</div>',
      '<div class="vex-custom-input-wrapper">',
      '<input name="inputURL" type="text" value="" id="inputURL" onclick="shuttle.radioThisURL()" placeholder="http://" />',
      '</div>',
      '</div>')

    inputs.push(
      '<div class="vex-custom-radio">',
      '<input type="radio" name="action" value="radioCurrent" id="radioCurrent"><label for="radioCurrent">' + locationMsg('chooseThisURL') + '</label><br>',
      '</div>')

    vex.dialog.buttons.YES.text = locationMsg('continue')
    vex.dialog.buttons.NO.text = locationMsg('cancel')
    vex.dialog.open({
      message: locationMsg('addBookmark'),
      input: inputs.join(''),
      callback: (data) => {
        if (data) {
          let url = ('inputURL' in data) ? data.inputURL : view.getURL()
          maxId = id
          shuttle.createBookmark(url, id)
          shuttle.addBookmarkToBar(url, id)
          shuttle.loadView(url, id)
        }
      }
    })
    shuttle.autofocusInput()
  },

  /** Creates a new bookmark and persists it */
  createBookmark: (url, id) => {
    db.get('bookmarks').push({id: id, url: url}).write()
    idToUrl[id] = url
  },

  /** Adds a bookmark to the bookmarks bar */
  addBookmarkToBar: (url, id) => {
    /* let favurl = url

    if (url.indexOf('http://') === -1 || url.indexOf('http://') === -1) {
      favurl = `http://${url}`
    } */

    if (url.startsWith('mod:')) {
      document.querySelector('.bookmarks-zone').innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="shuttle.loadView('${url}', ${id})" oncontextmenu="shuttle.askToRemoveBookmark(${id}, '${url}')" onmouseover="shuttle.showControlBar(event, 'show')" style="background-image: url(../app/modules/${url.replace('mod:', '')}/icon.png);"></a>`
    } else {
      fetch(`${iconGetter}/allicons.json?url=${url}`).then((resp) => resp.json()).then((data) => {
        document.querySelector('.bookmarks-zone').innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" title="${url}" onclick="shuttle.loadView('${url}', ${id})" oncontextmenu="shuttle.askToRemoveBookmark(${id}, '${url}')" onmouseover="shuttle.showControlBar(event, 'show')" style="background-image: url(${data.icons[0].url});"></a>`
      }).catch(() => {
        document.querySelector('.bookmarks-zone').innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" title="${url}" onclick="shuttle.loadView('${url}', ${id})" oncontextmenu="shuttle.askToRemoveBookmark(${id}, '${url}')" onmouseover="shuttle.showControlBar(event, 'show')" style="background-image: url(../assets/img/no-icon.png);"></a>`
      }).then(() => {
        shuttle.reloadAddButton()
      })
    }
    setTimeout(() => {
      shuttle.reloadAddButton()
    }, db.get('bookmarks').length * 1000)
  },

  /** reorder bookmarks and database after sorting */
  reorderBookmarks: () => {
    let newBookmarks = []
    bookmarkZone = document.querySelector('.bookmarks-zone')

    for (let i = 0; i < bookmarkZone.children.length; i++) {
      if (i !== 0) {
        let id = parseInt(bookmarkZone.children[i].id.match(/\d+/)[0])
        let bookmark = db.get('bookmarks').find({id: id}).value()
        newBookmarks.push(bookmark)
      }
    }

    db.set('bookmarks', newBookmarks).write()
  },

  /** Asks the user to confirm the removal of a given bookmark */
  askToRemoveBookmark: (id, url) => {
    vex.dialog.buttons.YES.text = locationMsg('continue')
    vex.dialog.buttons.NO.text = locationMsg('cancel')
    vex.dialog.confirm({
      message: `${locationMsg('removeBookmarks')} : ${url}`,
      callback: function (removalConfirmed) {
        if (removalConfirmed) {
          const bookmarkUrl = idToUrl[id]

          shuttle.removeBookmark(bookmarkUrl, id)
          shuttle.removeBookmarkFromBar(id)

          if (id === currentBookmarkId) {
            shuttle.displayLastBookmark()
          }
        }

        shuttle.reloadAddButton()

        vex.dialog.buttons.YES.text = 'Ok'
        vex.dialog.buttons.NO.text = 'Cancel'
      }
    })
  },

  /** Removes a bookmark and persists the change */
  removeBookmark: (url, id) => {
    const index = db.get('bookmarks').value().findIndex(bookmark => bookmark.id === id)
    db.get('bookmarks').splice(index, 1).write()

    delete idToUrl[id]
  },

  /** Removes a bookmark from the bookmarks bar */
  removeBookmarkFromBar: (id) => {
    document.querySelector(`#id-${id}`).remove()
  },

  /** Displays either the last bookmark, or Shuttle's home page if there aren't any bookmarks */
  displayLastBookmark: () => {
    if (bookmarks.length > 0) {
      const last = bookmarks[bookmarks.length - 1]
      shuttle.loadView(last.url, last.id)
    } else {
      shuttle.loadView('changelog.getshuttle.xyz')
    }
  },

  /** Displays a site within the webview */
  loadView: (url, id = undefined) => {
    if (settingsIsActive) {
      view.style.opacity = '1'
      view.style.zIndex = '50'
      settingsView.style.opacity = '0'
      settingsView.style.zIndex = '0'
      settingsIsActive = false
    }

    // Ignore the request if the site is already displayed
    if (id !== undefined && id === currentBookmarkId) { return } else { console.log(`Loading ${url}...`) }

    // If Electron is already loading an other view, make this one in standby
    // Avoids "did-fail-load" event to be triggered by loading differents views at once
    if (isLoadingAView) {
      nextBookmarkToDisplay = {url: url, id: id}
      return
    }

    if (url.startsWith('https://')) {
      currentBookmarkUrl = url
    } else if (url.startsWith('mod:')) {
      currentBookmarkUrl = `${__dirname}/../app/modules/${url.replace('mod:', '')}/index.html`
    } else if (url.startsWith('file:///')) {
      currentBookmarkUrl = url
    } else {
      url = (url.startsWith('http://')) ? url : 'http://' + url
      currentBookmarkUrl = url
    }

    adapter.adapteWebSite(currentBookmarkUrl)
    view.loadURL(currentBookmarkUrl, {userAgent: curentUserAgent})
    isLoadingAView = true

    currentBookmarkId = id
  },

  viewBack: () => {
    if (view.canGoBack()) {
      view.goBack()
    }
  },

  viewForward: () => {
    if (view.canGoForward()) {
      view.goForward()
    }
  },

  viewReload: () => {
    if (currentBookmarkId === 'error') {
      view.goForward()
    } else {
      shuttle.loadView(currentBookmarkUrl)
    }
  },

  showControlBar: (evt, event) => {
    if (event === 'show') {
      controlBar.style.display = 'block'
      controlBar.style.top = `${evt.clientY - 10}px`
    } else if (event === 'hide') {
      controlBar.style.display = 'none'
      controlBar.style.top = '0px'
    }
  },

  showSearchBar: () => {
    vex.dialog.buttons.YES.text = locationMsg('search')
    vex.dialog.buttons.NO.text = locationMsg('cancel')
    vex.dialog.prompt({
      message: locationMsg('quickSearch'),
      placeholder: locationMsg('search'),
      callback: (value) => {
        if (value) {
          shuttle.quickSearch(value)
        }
        vex.dialog.buttons.YES.text = 'Ok'
      }
    })
  },

  quickSearch: (search) => {
    if (search.startsWith('https://') || search.startsWith('http://') || search.startsWith('file:///')) {
      shuttle.loadView(search)
    } else {
      shuttle.loadView(`https://google.com/search?q=${search.split(' ').join('+')}`)
    }
  },

  openSettings: () => {
    view.style.opacity = '0'
    view.style.zIndex = '0'
    settingsView.style.opacity = '1'
    settingsView.style.zIndex = '50'

    settingsIsActive = true
  },

  checkForUpate: () => {
    ipcRenderer.send('CheckUpdate', bookmarks)
  },

  showFrame: (show) => {
    if (show) {
      view.style.top = '20px'
      titleBar.style.top = '0px'
      bookmarksBar.style.top = '10px'
    } else {
      view.style.top = '0'
      titleBar.style.top = '-20px'
      bookmarksBar.style.top = '0px'
    }
  },

  reloadAddButton: () => {
    document.querySelector('.add-btn').style.visibility = 'visible'
    document.querySelector('.add-btn').style.top = `${document.querySelectorAll('.bubble-btn').length * 34}px`
  },

  makeScreenshot: () => {
    view.capturePage((data) => {
      let img = data.toPNG().toString('base64')
      setTimeout(() => {
        let path = `${app.getPath('downloads')}/Capture${Math.floor((Math.random() * 10000) + 1)}.png`

        fs.writeFile(path, img.replace(/^data:image\/png;base64,/, ''), 'base64', function (err) {
          if (err) throw err
        })
        vex.dialog.buttons.YES.text = 'Ok'
        vex.dialog.buttons.NO.text = 'Open folder'
        vex.dialog.confirm({
          message: locationMsg('screenDone'),
          callback: function (value) {
            if (value) {
              return
            } else {
              remote.shell.showItemInFolder(path)
            }
            vex.dialog.buttons.YES.text = 'Ok'
            vex.dialog.buttons.NO.text = 'Cancel'
          }
        })
      }, 2000)
    })
  },

  changeUserAgent: () => {
    let userAgentBtn = document.querySelector('#userAgentBtn')

    if (userAgentIsPc === false) {
      view.setAttribute('useragent', pcUserAgent)

      curentUserAgent = pcUserAgent
      userAgentIsPc = true

      shuttle.viewReload()

      userAgentBtn.style.webkitTransform = "rotate(180deg)"
    } else {
      view.setAttribute('useragent', mobileUserAgent)

      curentUserAgent = mobileUserAgent
      userAgentIsPc = false

      shuttle.viewReload()

      userAgentBtn.style.webkitTransform = "rotate(0deg)"
    }
  },

  minimizeWindow: () => {
    remote.BrowserWindow.getFocusedWindow().minimize()
  },

  quitWindow: () => {
    remote.BrowserWindow.getFocusedWindow().close()
  },

  setFullscreen: (bool) => {
    if (settings.get('settings.ShowFrame').value() === true) {
      shuttle.showFrame(!bool)
    }

    browser.setFullScreen(bool)

    if (bool) {
      bookmarksBar.style.visibility = 'hidden'
      controlBar.style.visibility = 'hidden'
      document.querySelector('.add-btn').style.visibility = 'hidden'
      document.querySelector('.btn-bar').style.visibility = 'hidden'
      view.style.left = '0px'
    } else {
      bookmarksBar.style.visibility = 'visible'
      controlBar.style.visibility = 'visible'
      document.querySelector('.add-btn').style.visibility = 'visible'
      document.querySelector('.btn-bar').style.visibility = 'visible'
      view.style.left = '35px'
      view.executeJavaScript(`
        document.webkitExitFullscreen()
      `)
    }
  }
}

// app init
shuttle.initBookmarks(bookmarks)
shuttle.showFrame(settings.get('settings.ShowFrame').value())
shuttle.reloadAddButton()

view.addEventListener('did-fail-load', (errorCode, errorDescription, validatedURL) => {
  console.log()
  currentBookmarkId = 'error'
  if (navigator.onLine === false) {
    view.loadURL(`file://${__dirname}/../views/no_internet.html?text=NO INTERNET CONNECTION`)
  } else {
    if (errorCode.errorDescription) {
      view.loadURL(`file://${__dirname}/../views/no_internet.html?text=${errorCode.errorDescription}`)
    } else {
      view.loadURL(`file://${__dirname}/../views/no_internet.html?text=UNKNOW ERROR`)
    }
  }
})

view.addEventListener('did-start-loading', () => {
  let loaderImg = document.querySelector('.loader')
  loaderImg.style.visibility = "visible"

  view.style.opacity = '0'
  view.style.zIndex = '0'

})

view.addEventListener('did-stop-loading', () => {

  let loaderImg = document.querySelector('.loader')
  loaderImg.style.visibility = "hidden"

  view.style.opacity = '1'
  view.style.zIndex = '50'

})

view.addEventListener('did-finish-load', () => {
  isLoadingAView = false

  // If the user asked to display a new bookmark while loading,
  // let's display the requested one
  if (nextBookmarkToDisplay !== undefined) {
    shuttle.loadView(nextBookmarkToDisplay.url, nextBookmarkToDisplay.id)
    nextBookmarkToDisplay = undefined
  }
})

view.addEventListener('dom-ready', () => {
  view.insertCSS(`\
  ::-webkit-scrollbar { 
    width: 7px; 
    height: 7px; 
    background-color: #F4F4F4; 
    z-index: 9999999;
    }
    
    ::-webkit-scrollbar-thumb { 
    background-color: #333333; 
    } 
  `)
})

view.addEventListener('enter-html-full-screen', () => {
  shuttle.setFullscreen(true)
})

view.addEventListener('leave-html-full-screen', () => {
  shuttle.setFullscreen(false)
})

ipcRenderer.on('addframe', (event, arg) => {
  console.log(`Frame: ${arg}`)
  shuttle.showFrame(arg)
})

ipcRenderer.on('addBmks', (event, arg) => {
  shuttle.askNewBookAddress()
})

ipcRenderer.on('openSettings', (event, arg) => {
  shuttle.openSettings()
})

ipcRenderer.on('refreshApp', (event, arg) => {
  location.reload()
})

ipcRenderer.on('home', (event, arg) => {
  shuttle.loadView('changelog.getshuttle.xyz')
})

ipcRenderer.on('quicksearch', (event, arg) => {
  shuttle.showSearchBar()
})

ipcRenderer.on('screenshot', (event, arg) => {
  shuttle.makeScreenshot()
})

ipcRenderer.on('bookmarkThisPage', (event, arg) => {
  shuttle.bookmarkThisPage()
})

ipcRenderer.on('quitFullscreen', (event, arg) => {
  shuttle.setFullscreen(false)
})

window.addEventListener('online', () => {
  shuttle.initBookmarks(bookmarks)
  shuttle.loadView('https://changelog.getshutttle.xyz')
})

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.bookmark-zone').addEventListener('mouseleave', function (e) {
    console.log('You leave !')
  })
})

// eslint-disable-next-line no-unused-vars
const sort0able = Sortable.create(document.getElementsByClassName('bookmarks-zone')[0], {
  animation: 150,
  ghostClass: 'ghost',
  onUpdate: shuttle.reorderBookmarks,
  filter: '.add-btn'
})

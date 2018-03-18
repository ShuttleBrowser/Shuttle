// modules
const fs = require('fs')
const winston = require('winston')
const {remote, ipcRenderer} = require('electron')
const {app} = require('electron').remote;
const lowdb = require('lowdb')

const locationMsg = require(`${__dirname}/../app/modules/lang.js`)
const adapter = require(`${__dirname}/../app/modules/adapter.js`)

// Lowdb db init
const FileSync = require('lowdb/adapters/FileSync')
const bookmarksFile = new FileSync(`${app.getPath('userData')}/db.json`)
const settingsFile = new FileSync(`${app.getPath('userData')}/settings.json`)

const db = lowdb(bookmarksFile)
const settings = lowdb(settingsFile)

db.defaults({ bookmarks: [] }).write()

// init winston
winston.add(winston.transports.File, { filename: `${__dirname}/../app/logs/Latest.log` })

// elements for DOM
const bookmarksBar = document.querySelector('.bkms-bar')
const bookmarkZone = document.querySelector('.bookmarks-zone')
const controlBar = document.querySelector('.control-bar')
const searchBar = document.querySelector('.search-bar')
const titleBar = document.querySelector('.title-bar')
const view = document.querySelector('webview')
const settingsView = document.querySelector('#settings')

// get the browser window
const browser = remote.getCurrentWindow()

let bookmarks = db.get('bookmarks').value()

// Manage bookmarks' id & makes possible to access a bookmark from its url
let idToUrl = {}
let maxId = 0

// Make possible to load views one at a time, avoiding did-fail-load events
let currentBookmarkId
let isLoadingAView = false
let nextBookmarkToDisplay

let settingsIsActive;

const shuttle = {
  
  /** Initializes the bookmarks bar with given bookmarks */
  initBookmarks: (bkmarks) => {
    bookmarksBar.innerHTML = ''
    bookmarksBar.innerHTML += `<a href="#" class="shuttle-btn" onclick="shuttle.loadView('changelog.getshuttle.xyz')"><img src="" alt=""></a><hr>`
    bookmarksBar.innerHTML += `<div class="bookmarks-zone"></div>`
    for (i in bkmarks) {
      maxId = Math.max(maxId, bkmarks[i].id)
      shuttle.addBookmarkToBar(bkmarks[i].url, bkmarks[i].id)
    }
  },

  /** Asks the user the address of the bookmark he wants to add */
  askNewBookAddress: (id = maxId + 1) => {
    vex.dialog.buttons.YES.text = locationMsg('continue')
    vex.dialog.buttons.NO.text = locationMsg('cancel')
    vex.dialog.prompt({
      message: locationMsg('addBookmark'),
      placeholder: 'http://',
      callback: (url) => {
        if (url) {
          maxId = id
          shuttle.createBookmark(url, id)
          shuttle.addBookmarkToBar(url, id)
          shuttle.loadView(url, id)
        }
      }
    })
  },
  
  /** Creates a new bookmark and persists it */
  createBookmark: (url, id) => {
    db.get('bookmarks').push({ id: id, url: url }).write()
    idToUrl[id] = url
  },
  
  /** Adds a bookmark to the bookmarks bar */
  addBookmarkToBar: (url, id) => {
    if (url.startsWith('mod:')) {
      document.querySelector('.bookmarks-zone').innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="shuttle.loadView('${url}', ${id})" oncontextmenu="shuttle.askToRemoveBookmark('${id}')" onmouseover="shuttle.showControlBar('id-${id}', 'show')" style="background-image: url(../app/modules/${url.replace('mod:', '')}/icon.png);"></a>`
    } else {
      fetch(`http://besticon-demo.herokuapp.com/allicons.json?url=${url}`).then((resp) => resp.json()).then((data) => {
        document.querySelector('.bookmarks-zone').innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="shuttle.loadView('${url}', ${id})" oncontextmenu="shuttle.askToRemoveBookmark('${id}')" onmouseover="shuttle.showControlBar('id-${id}', 'show')" style="background-image: url(${data.icons[0].url});"></a>`
      }).catch((error) => {
        document.querySelector('.bookmarks-zone').innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="shuttle.loadView('${url}', ${id})" oncontextmenu="shuttle.askToRemoveBookmark('${id}')" onmouseover="shuttle.showControlBar('id-${id}', 'show')" style="background-image: url(../../assets/img/no-icon.png);"></a>`
      }).then(() => {
        shuttle.reloadAddButton()
      })
    }
    setTimeout(() => {
      shuttle.reloadAddButton()
    }, db.get('bookmarks').length * 1000)
  },
  
  /** Asks the user to confirm the removal of a given bookmark */
  askToRemoveBookmark: (id) => {
    vex.dialog.buttons.YES.text = locationMsg('continue')
    vex.dialog.buttons.NO.text = locationMsg('cancel')
    vex.dialog.confirm({
      message: locationMsg('removeBookmarks'),
      callback: function (removalConfirmed) {
        if (removalConfirmed) {
          bookmarkUrl = idToUrl[id]

          shuttle.removeBookmark(bookmarkUrl, id)
          shuttle.removeBookmarkFromBar(id)

          if( id == currentBookmarkId )
            shuttle.displayLastBookmark()
        }

        shuttle.reloadAddButton()

        vex.dialog.buttons.YES.text = 'Ok'
        vex.dialog.buttons.NO.text = 'Cancel'
      }
    })
  },

  /** Removes a bookmark and persists the change */
  removeBookmark: (url, id) => {
    const index = db.get('bookmarks').value().findIndex(bookmark => bookmark.id == id)
    db.get('bookmarks').splice(index, 1).write()

    delete idToUrl[id]
  },  

  /** Removes a bookmark from the bookmarks bar */
  removeBookmarkFromBar: (id) => {
    document.querySelector(`#id-${id}`).remove()
  },

  /** Displays either the last bookmark, or Shuttle's home page if there aren't any bookmarks */
  displayLastBookmark: () => {
    if( bookmarks.length > 0 ) {
      last = bookmarks[bookmarks.length-1]
      shuttle.loadView(last.url, last.id)
    }
    else {
      shuttle.loadView('changelog.getshuttle.xyz')
    }
  },

  /** Displays a site within the webview */
  loadView: (url, id = undefined) => {

    if (settingsIsActive) {
      view.style.visibility = "visible"
      settingsView.style.visibility = "hidden"
      settingsIsActive = false
    }

    // Ignore the request if the site is already displayed
    if (id !== undefined && id === currentBookmarkId) { return } else { console.log(`Loading ${url}...`) }

    // If Electron is already loading an other view, make this one in standby
    // Avoids "did-fail-load" event to be triggered by loading differents views at once
    if (isLoadingAView) {
      nextBookmarkToDisplay = { url: url, id: id }
      return
    }

    if (url.startsWith('https://')) {
        adapter.adapteWebSite(url)
        view.loadURL(url)
        isLoadingAView = true
    } else if (url.startsWith('mod:')) {
        view.loadURL(`${__dirname}/../app/modules/${url.replace('mod:', '')}/index.html`)
        isLoadingAView = true
    } else if (url.startsWith('file:///')) {
        adapter.adapteWebSite(url)
        view.loadURL(url)
    } else {
        adapter.adapteWebSite(url)
        view.loadURL('http://' + url)
        isLoadingAView = true
    }
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
      view.reload()
    }
  },

  showControlBar: (id, event) => {
    if (event === 'show') {
      controlBar.style.display = 'block'
      controlBar.style.top = `${document.querySelector('#' + id).offsetTop + document.querySelector('.bookmarks-zone').offsetTop - 1}px`
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
    view.style.visibility = "hidden"
    settingsView.style.visibility = "visible"
    settingsIsActive = true
  },

  checkForUpate: () => {
    ipcRenderer.send('CheckUpdate', bookmarks)
  },

  showFrame: (show) => {
    if (show) {
      view.style.top = "15px"
      titleBar.style.top = "0"
    } else {
      view.style.top = "0"
      titleBar.style.top = "-15px"
    }
  },

  reloadAddButton: () => {
    if (bookmarks.length >= 14) {
      document.querySelector('.add-btn').style.visibility = "hidden"
    } else {
      document.querySelector('.add-btn').style.visibility = "visible"
      document.querySelector('.add-btn').style.top = `${document.querySelector('.bookmarks-zone').offsetHeight + document.querySelector('.bookmarks-zone').offsetTop}px`
    }
  },

  makeScreenshot: () => {
    view.capturePage((data) => {
      let img = data.toPng().toString('base64')
      setTimeout(() => {
        let path = `${app.getPath('downloads')}/Capture${Math.floor((Math.random() * 10000) + 1)}.png`

        fs.writeFile(path, img.replace(/^data:image\/png;base64,/, ''), 'base64', function(err) {
          if (err) throw err;
        });
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

      }, 2000);
    });
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
    view.loadURL(__dirname + '/no_internet.html?text=NO INTERNET CONNECTION')
  } else {
    if (errorCode.errorDescription) {
      view.loadURL(__dirname + `/no_internet.html?text=${errorCode.errorDescription}`)
    } else {
      view.loadURL(__dirname + `/no_internet.html?text=UNKNOW ERROR`)
    }
  }
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
  browser.setFullScreen(true)
  bookmarksBar.style.visibility = 'hidden'
  controlBar.style.visibility = 'hidden'
  document.querySelector('.add-btn').style.visibility = 'hidden'
  document.querySelector('.btn-bar').style.visibility = 'hidden'
  view.style.left = '0px'
})
view.addEventListener('leave-html-full-screen', () => {
  browser.setFullScreen(false)
  bookmarksBar.style.visibility = 'visible'
  controlBar.style.visibility = 'visible'
  document.querySelector('.add-btn').style.visibility = 'visible'
  document.querySelector('.btn-bar').style.visibility = 'visible'
  view.style.left = '35px'
})

view.addEventListener('did-start-loading', () => {
  view.style.visibility = 'hidden'
  document.querySelector('.loader').style.visibility = 'visible'
})

view.addEventListener('did-stop-loading', () => {
  document.querySelector('.loader').style.visibility = 'hidden'
  view.style.visibility = 'visible'
})

ipcRenderer.on('addframe', (event, arg) => {
  console.log(`Frame: ${arg}`)
  shuttle.showFrame(arg)
})

ipcRenderer.on('openSettings', (event, arg) => {
  shuttle.openSettings()
})

ipcRenderer.on('refreshApp', (event, arg) => {
  location.reload()
})

window.addEventListener('online', () => {
  shuttle.initBookmarks(bookmarks)
  shuttle.loadView('https://changelog.getshutttle.xyz')
})
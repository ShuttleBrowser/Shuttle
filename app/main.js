// modules
const favicon = require('favicon-getter').default
const fs = require('fs')
const winston = require('winston')
const {remote, ipcRenderer} = require('electron')
const {app} = require('electron').remote;
const adapter = require(`${__dirname}/../app/modules/adapter.js`)
const lowdb = require('lowdb')

// Lowdb db init
const FileSync = require('lowdb/adapters/FileSync')
const LowdbAdapter = new FileSync(`${app.getPath('userData')}/db.json`)
const db = lowdb(LowdbAdapter)

db.defaults({ bookmarks: [] }).write()

// init winston
winston.add(winston.transports.File, { filename: `${__dirname}/../app/logs/Latest.log` })

// elements for DOM
const bookmarksBar = document.querySelector('.bkms-bar')
const controlBar = document.querySelector('.control-bar')
const searchBar = document.querySelector('.search-bar')
const view = document.querySelector('webview')

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

const shuttle = {
  
  /** Initializes the bookmarks bar with given bookmarks */
  initBookmarks: (bkmarks) => {
    bookmarksBar.innerHTML = ''
    bookmarksBar.innerHTML += `<a href="#" class="shuttle-btn" onclick="shuttle.loadView('changelog.getshuttle.xyz')"><img src="" alt=""></a><hr>`
    bookmarksBar.innerHTML += '<a href="javascript:shuttle.askNewBookAddress()" class="add-btn"></a>'
    for (i in bkmarks) {
      maxId = Math.max(maxId, bkmarks[i].id)
      shuttle.addBookmarkToBar(bkmarks[i].url, bkmarks[i].id)
    }
  },

  /** Asks the user the address of the bookmark he wants to add */
  askNewBookAddress: (id = maxId + 1) => {
    vex.dialog.prompt({
      message: 'Enter the url of a website',
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
      bookmarksBar.innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="shuttle.loadView('${url}', ${id})" oncontextmenu="shuttle.askToRemoveBookmark('${id}')" onmouseover="shuttle.showControlBar('id-${id}', 'show')" style="background-image: url(../app/modules/${url.replace('mod:', '')}/icon.png);"></a>`
    } else {
      fetch(`http://besticon-demo.herokuapp.com/allicons.json?url=${url}`).then((resp) => resp.json()).then((data) => {
        bookmarksBar.innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="shuttle.loadView('${url}', ${id})" oncontextmenu="shuttle.askToRemoveBookmark('${id}')" onmouseover="shuttle.showControlBar('id-${id}', 'show')" style="background-image: url(${data.icons[0].url});"></a>`
      }).catch((error) => {
        bookmarksBar.innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="shuttle.loadView('${url}', ${id})" oncontextmenu="shuttle.askToRemoveBookmark('${id}')" onmouseover="shuttle.showControlBar('id-${id}', 'show')" style="background-image: url(../../assets/img/no-icon.png);"></a>`
      })
    }
  },
  
  /** Asks the user to confirm the removal of a given bookmark */
  askToRemoveBookmark: (id) => {
    vex.dialog.buttons.YES.text = 'Yes'
    vex.dialog.buttons.NO.text = 'No'
    vex.dialog.confirm({
      message: `Removing ${} bookmark ?`,
      callback: function (removalConfirmed) {
        if (removalConfirmed) {
          bookmarkUrl = idToUrl[id]
          
          shuttle.removeBookmark(bookmarkUrl, id)
          shuttle.removeBookmarkFromBar(id)

          if( id == currentBookmarkId )
            shuttle.displayLastBookmark()
        }
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
    // Ignore the request if the site is already displayed
    if (id !== undefined && id === currentBookmarkId) { return }

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

  showControlBar: (id, event) => {
    if (event === 'show') {
      controlBar.style.display = 'block'
      controlBar.style.top = `${document.querySelector('#' + id).offsetTop - 1}px`
    } else if (event === 'hide') {
      controlBar.style.display = 'none'
      controlBar.style.top = '0px'
    }
  },

  showSearchBar: () => {
      vex.dialog.buttons.YES.text = 'Search'
      vex.dialog.prompt({
        message: 'Enter your quick search bellow ?',
        placeholder: 'Search',
        callback: (value) => {
          if (value) {
            shuttle.quickSearch(value)
          }
          vex.dialog.buttons.YES.text = 'Ok'
        }
    })
  },

  quickSearch: (search) => {
    view.loadURL(`https://google.com/search?q=${search.split(' ').join('+')}`)
  },

  openSettings: () => {
    view.loadURL(`file:///${__dirname}/settings.html`)
  },

  checkForUpate: () => {
    ipcRenderer.send('CheckUpdate', bookmarks)
  }

}

// app init
shuttle.initBookmarks(bookmarks)

view.addEventListener('did-fail-load', () => {
  if (navigator.onLine === false) {
    view.loadURL(__dirname + '/no_internet.html?text=NO INTERNET CONNECTION')
  } else {
    view.loadURL(__dirname + '/no_internet.html?text=AN ERROR OCCURED')
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
              } 
              
              ::-webkit-scrollbar-thumb { 
                background-color: #white; 
              } 
              `)
})

view.addEventListener('enter-html-full-screen', () => {
  browser.setFullScreen(true)
  bookmarksBar.style.display = 'none'
  controlBar.style.display = 'none'
  view.style.left = '0px'
})
view.addEventListener('leave-html-full-screen', () => {
  browser.setFullScreen(false)
  bookmarksBar.style.display = 'block'
  controlBar.style.display = 'block'
  view.style.left = '35px'
})

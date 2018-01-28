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

let currentBookmarkId

// Make possible to load views one at a time, avoiding did-fail-load events
let isLoadingAView = false
let nextBookmarkToDisplay

const shuttle = {
  
  /** Creates a new bookmark in the bookmarks bar for each entry in bkmarks. */
  createBookmarks: (bkmarks) => {
    bookmarksBar.innerHTML = ''
    bookmarksBar.innerHTML += `<a href="#" class="shuttle-btn" onclick="shuttle.loadView('changelog.getshuttle.xyz')"><img src="" alt=""></a><hr>`
    bookmarksBar.innerHTML += '<a href="javascript:shuttle.saveBookmark()" class="add-btn"></a>'
    for (i in bkmarks) {
      shuttle.createBookmark(bkmarks[i].url, i)
    }
  },

  /** Saves a new bookmark and creates it in the bookmarks bar */
  saveBookmark: (id = bookmarks.length + 1) => {
    vex.dialog.prompt({
      message: 'Enter the url of a website',
      placeholder: 'http://',
      callback: (url) => {
        if (url) {
          db.get('bookmarks').push({ url : url }).write()
          shuttle.createBookmark(url, id)
        }
      }
    })
  },

  /** Creates a new bookmark in the bookmarks bar */
  createBookmark: (url, id) => {
    if (url.startsWith('mod:')) {
      bookmarksBar.innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="shuttle.loadView('${url}', ${id})" oncontextmenu="shuttle.removeBookmark('${id}')" onmouseover="shuttle.showControlBar('id-${id}', 'show')" style="background-image: url(../app/modules/${url.replace('mod:', '')}/icon.png);"></a>`
    } else {
      fetch(`https://shuttleapp.herokuapp.com/icons/${url}`).then((resp) => resp.json()).then((data) => {
        bookmarksBar.innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="shuttle.loadView('${url}', ${id})" oncontextmenu="shuttle.removeBookmark('${id}')" onmouseover="shuttle.showControlBar('id-${id}', 'show')" style="background-image: url(${data.url});"></a>`
      }).catch((error) => {
        bookmarksBar.innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="shuttle.loadView('${url}', ${id})" oncontextmenu="shuttle.removeBookmark('${id}')" onmouseover="shuttle.showControlBar('id-${id}', 'show')" style="background-image: url(../../assets/img/no-icon.png);"></a>`
      })
    }
  },

  /** Removes a bookmark from the bookmarks bar */
  removeBookmark: (id) => {
    vex.dialog.buttons.YES.text = 'Yes'
    vex.dialog.buttons.NO.text = 'No'
    vex.dialog.confirm({
      message: `Removing bookmark ?`,
      callback: function (value) {
        if (value) {
          winston.info('Removing bookmark with id ' + id)
          document.querySelector(`#id-${id}`).remove()
          db.get('bookmarks').remove({ url: bookmarks[id].url }).write()
        }
        vex.dialog.buttons.YES.text = 'Ok'
        vex.dialog.buttons.NO.text = 'Cancel'
      }
    })
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
      // if the computer is connnected to internet
      if (navigator.onLine) {
        adapter.adapteWebSite(url)
        view.loadURL(url)
        isLoadingAView = true
        // else we load the "no_internet" page
      } else {
        view.loadURL(__dirname + '/no_internet.html?text=NO INTERNET CONNECTION')
      }
    } else if (url.startsWith('mod:')) {
      view.loadURL(`${__dirname}/../app/modules/${url.replace('mod:', '')}/index.html`)
      isLoadingAView = true
    } else {
      if (navigator.onLine) {
        adapter.adapteWebSite(url)
        view.loadURL('http://' + url)
        isLoadingAView = true
      } else {
        view.loadURL(__dirname + '/no_internet.html?text=NO INTERNET CONNECTION')
      }
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
    ipcRenderer.send('openSettings', bookmarks)
  },

  checkForUpate: () => {
    ipcRenderer.send('CheckUpdate', bookmarks)
  }

}

// app init
shuttle.createBookmarks(bookmarks)

view.addEventListener('did-fail-load', () => {
  view.loadURL(__dirname + '/no_internet.html?text=AN ERROR OCCURED')
})

view.addEventListener('did-finish-load', () => {
  isLoadingAView = false

  // If the user asked to display a new bookmark while loading,
  // let's display the requested one
  if (nextBookmarkToDisplay !== undefined) {
    winston.info('loading finished')
    shuttle.loadView(nextBookmarkToDisplay.url, nextBookmarkToDisplay.id)
    nextBookmarkToDisplay = undefined
  }
})

view.addEventListener('dom-ready', () => {
  view.insertCSS(`\
              ::-webkit-scrollbar { 
                width: 5px; 
                height: 5px; 
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

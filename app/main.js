// modules
const favicon = require('favicon-getter').default
const fs = require('fs')
const winston = require('winston')
const {remote, ipcRenderer} = require('electron')
const adapter = require(`${__dirname}/../app/modules/adapter.js`)

// init winston
winston.add(winston.transports.File, { filename: `${__dirname}/../app/logs/Latest.log` })

// elements for DOM
const bookmarksBar = document.querySelector('.bkms-bar')
const controlBar = document.querySelector('.control-bar')
const searchBar = document.querySelector('.search-bar')
const view = document.querySelector('webview')

// get the browser window
const browser = remote.getCurrentWindow()

// the data value
// a faire : chercher le contenue du fichier et le mettre dans la variable. Si la personne a de la co et qu'elle a la syncro activée sa get le json sur le serveur
const bookmarksFilePath = `${__dirname}/../app/bookmarks.json`
const bookmarksFile = fs.readFileSync(bookmarksFilePath) + ']'
let bookmarks = JSON.parse(bookmarksFile)

const shuttle = {

  /** Creates a new bookmark in the bookmarks bar for each entry in bkmarks. */
  createBookmarks: (bkmarks) => {
    bookmarksBar.innerHTML = ''
    bookmarksBar.innerHTML += `<a href="#" class="shuttle-btn" onclick="shuttle.loadView('changelog.getshuttle.xyz')"><img src="" alt=""></a><hr>`
    for (i in bkmarks) {
      shuttle.createBookmark(bkmarks[i].web, i)
    }
  },

	/** Saves a new bookmark and creates it in the bookmarks bar */
  saveBookmark: (url, id = bookmarks.length + 1) => {
    fs.appendFile(bookmarksFilePath, `,{"web":"${url}"}`, function (err) {
      if (err) {
        winston.error('Unable to save bookmark: ' + err)
      }
      shuttle.createBookmark(url, id)
      bookmarksFile = fs.readFileSync(bookmarksFilePath) + ']'
      bookmarks = JSON.parse(bookmarksFile)
    })
  },

  /** Creates a new bookmark in the bookmarks bar */
  createBookmark: (url, id) => {
    if (url.startsWith('modules://')) {
      bookmarksBar.innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="shuttle.loadView('${url}')" oncontextmenu="shuttle.removeBkms('${id}')" onmouseover="shuttle.showControlBar('id-${id}', 'show')" style="background-image: url(../app/modules/${url.replace('modules://', '')}/icon.ico);"></a>`
    } else {
      fetch(`https://shuttleapp.herokuapp.com/icons/${url}`).then((resp) => resp.json()).then((data) => {
        bookmarksBar.innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="shuttle.loadView('${url}')" oncontextmenu="shuttle.removeBkms('${id}')" onmouseover="shuttle.showControlBar('id-${id}', 'show')" style="background-image: url(${data.url});"></a>`
      }).catch((error) => {
        bookmarksBar.innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="shuttle.loadView('${url}')" oncontextmenu="shuttle.removeBkms('${id}')" onmouseover="shuttle.showControlBar('id-${id}', 'show')" style="background-color: gray"></a>`
      })
    }
  },

  /** Removes a bookmark from the bookmarks bar */
  removeBookmark: (id) => {
  	winston.info("Removing bookmark with id " + id)
    document.querySelector(`#id-${id}`).remove()
    bookmarks.replace(`{"web": "${bookmarks[id].web}"}`, '')
  },

  // function to load page
  loadView: (url) => {
    if (url.startsWith('https://')) {
      // if the computer is connnected to internet
      if (navigator.onLine) {
        adapter.adapteWebSite(url)
        view.loadURL(url)
        // else we load the "no_internet" page
      } else {
        view.loadURL(__dirname + '/no_internet.html?text=NO INTERNET CONNECTION')
      }
    } else if (url.startswith('modules://')) {
      view.loadURL(`${__dirname}/../app/modules/${url.replace('modules://', '')}`)
    } else {
      if (navigator.onLine) {
        view.loadURL('http://' + url)
      } else {
        view.loadURL(__dirname + '/no_internet.html?text=NO INTERNET CONNECTION')
      }
    }
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
  	}
  },

  showSearchBar: (event) => {
  	if (event === 'show') {
	  	searchBar.style.display = 'block'
  	} else if (event === 'hide') {
	  	searchBar.style.display = 'none'
  	}
  },

  quickSearch: () => {
  	const searchValue = document.querySelector('#quickSearch').value
  	view.loadURL(`https://google.com/search?q=${searchValue.split(' ').join('+')}`)
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

view.addEventListener('did-fail-load', function () {
  view.loadURL(__dirname + '/no_internet.html?text=NO INTERNET CONNECTION')
})

view.addEventListener('dom-ready', function () {
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

view.addEventListener('enter-html-full-screen', function () {
  browser.setFullScreen(true)
  bookmarksBar.style.display = 'none'
  controlBar.style.display = 'none'
  view.style.left = '0px'
})
view.addEventListener('leave-html-full-screen', function () {
  browser.setFullScreen(false)
  bookmarksBar.style.display = 'block'
  controlBar.style.display = 'block'
  view.style.left = '35px'
})

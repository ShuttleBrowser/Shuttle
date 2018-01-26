// modules
const favicon = require('favicon-getter').default
const fs = require('fs')
const winston = require('winston')
const {remote, ipcRenderer} = require('electron')
const adapter = require(`${__dirname}/../app/modules/adapter.js`)

// init winston
winston.add(winston.transports.File, { filename: `${__dirname}/../app/logs/Latest.log` })

// elements for DOM
const bkmsBar = document.querySelector('.bkms-bar')
const ControlBar = document.querySelector('.control-bar')
const SearchBar = document.querySelector('.search-bar')
const view = document.querySelector('webview')

// path to the data file
const dataPath = `${__dirname}/../app/data.json`

// get the browser window
const browser = remote.getCurrentWindow()

// the data value
// a faire : chercher le contenue du fichier et le mettre dans la variable. Si la personne a de la co et qu'elle a la syncro activée sa get le json sur le serveur
let fileData = fs.readFileSync(dataPath) + ']'
let data = JSON.parse(fileData)

const shuttle = {

  loadBkms: (data) => {
    bkmsBar.innerHTML = ''
    bkmsBar.innerHTML += `<a href="#" class="shuttle-btn" onclick="shuttle.loadView('changelog.getshuttle.xyz')"><img src="" alt=""></a><hr>`
    for (i in data) {
      shuttle.createBkms(data[i].web, i)
    }
  },

	// function to add bookmarks
  addBkms: (url, id = data.length + 1) => {
    fs.appendFile(dataPath, `,{"web":"${url}"}`, function (err) {
      if (err) {
        winston.log('error ' + err)
      }
      shuttle.createBkms(url, id)
      fileData = fs.readFileSync(dataPath) + ']'
      data = JSON.parse(fileData)
    })
  },

  createBkms: (url, id) => {
    if (url.indexOf('modules://') == 0) {
      bkmsBar.innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="shuttle.loadView('${url}')" oncontextmenu="shuttle.removeBkms('${id}')" onmouseover="shuttle.showControlBar('id-${id}', 'show')" style="background-image: url(../app/modules/${url.replace('modules://', '')}/icon.ico);"></a>`
    } else {
      fetch(`https://shuttleapp.herokuapp.com/icons/${url}`).then((resp) => resp.json()).then((data) => {
        bkmsBar.innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="shuttle.loadView('${url}')" oncontextmenu="shuttle.removeBkms('${id}')" onmouseover="shuttle.showControlBar('id-${id}', 'show')" style="background-image: url(${data.url});"></a>`
      }).catch((error) => {
        bkmsBar.innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="shuttle.loadView('${url}')" oncontextmenu="shuttle.removeBkms('${id}')" onmouseover="shuttle.showControlBar('id-${id}', 'show')" style="background-color: gray"></a>`
      })
    }
  },

  removeBkms: (id) => {
  	console.log(id)
    document.querySelector(`#id-${id}`).remove()
    data.replace(`{"web": "${data[id].web}"}`, '')
  },

  // function to load page
  loadView: (url) => {
    // if http is in url
    if (url.indexOf('https://') == 0 || url.indexOf('https://') == 0) {
      // if the computer is connnected to internet
      if (navigator.onLine === true) {
        adapter.adapteWebSite(url)
        view.loadURL(url)
        // else we load the "no_internet" page
      } else {
        view.loadURL(__dirname + '/no_intenet.html?text=NO INTERNET CONNECTION')
      }
    } else if (url.indexOf('modules://') == 0) {
      view.loadURL(`${__dirname}/../app/modules/${url.replace('modules://', '')}`)
    } else {
      if (navigator.onLine === true) {
        view.loadURL('http://' + url)
      } else {
        view.loadURL(__dirname + '/no_intenet.html?text=NO INTERNET CONNECTION')
      }
    }
  },

  ViewBack: () => {
  	if (view.canGoBack() === true) {
  		view.goBack()
  	}
  },

  ViewForward: () => {
  	if (view.canGoForward() === true) {
  		view.goForward()
  	}
  },

  showControlBar: (id, event) => {
  	if (event === 'show') {
	  	ControlBar.style.display = 'block'
	  	ControlBar.style.top = `${document.querySelector('#' + id).offsetTop - 1}px`
  	} else if (event === 'hide') {
	  	ControlBar.style.display = 'none'
  	}
  },

  showSearchBar: (event) => {
  	if (event === 'show') {
	  	SearchBar.style.display = 'block'
  	} else if (event === 'hide') {
	  	SearchBar.style.display = 'none'
  	}
  },

  quickSearch: () => {
  	let SearchValue = document.querySelector('#quickSearch').value
  	view.loadURL(`https://google.com/search?q=${SearchValue.split(' ').join('+')}`)
  },

  openSettings: () => {
    ipcRenderer.send('openSettings', data)
  },

  checkForUpate: () => {
    ipcRenderer.send('CheckUpdate', data)
  }

}

// app init
shuttle.loadBkms(data)

view.addEventListener('did-fail-load', function () {
  view.loadURL(__dirname + '/no_intenet.html?text=NO INTERNET CONNECTION')
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
  bkmsBar.style.display = 'none'
  ControlBar.style.display = 'none'
  view.style.left = '0px'
})
view.addEventListener('leave-html-full-screen', function () {
  browser.setFullScreen(false)
  bkmsBar.style.display = 'block'
  ControlBar.style.display = 'block'
  view.style.left = '35px'
})

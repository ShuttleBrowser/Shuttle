// modules
const favicon = require('favicon-getter').default

// elements for DOM
const bkmsBar = document.querySelector('.bkms-bar')
const view = document.querySelector('webview')

const shuttle = {

	// function to add bookmarks
  addBkms: (url) => {
    fetch(`https://icons.better-idea.org/allicons.json?url=${url}`).then((resp) => resp.json()).then(function (data) {
      bkmsBar.innerHTML += `<a href="#" class="bubble-btn" onclick="shuttle.loadView('${url}')" oncontextmenu="shuttle.removeBkms(${url})" style="background-image: url(${data.icons[0].url});"></a>`
    }).catch(function (error) {
    	console.log('Error')
  	})
  },

  removeBkms: (url) => {
  	console.log(url)
  },

  // function to load page
  loadView: (url) => {
    if (navigator.onLine === true) {
      view.loadURL('http://' + url)
    } else {
      view.loadURL(__dirname + '/no_intenet.html?text=NO INTERNET CONNECTION')
    }
  }

}

// app init
view.addEventListener('did-fail-load', function () {
  view.loadURL(__dirname + '/no_intenet.html?text=WEBSITE NOT FOUND')
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

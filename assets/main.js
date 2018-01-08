const npath = require('path')

// get the webview
const webview = document.querySelector('webview')

// get the navbar
const bar = document.querySelector('.bar')

// get the path of json file
const path = 'data.json'

// import electron
const {shell} = require('electron')

// set $ to jQuery function
const $ = jQuery

// get the window
const windowse = remote.getCurrentWindow()

// set the title bar
const titlebar = '<div class="title-bar"><p id="title-bar-title"></p><a onmousedown="return false" href="#" onclick="closeWindow()"><img src="./assets/img/close.png"></a></div>'

console.log('loading main.js !')

let lang
// Check language
if (osLocale.sync().indexOf('fr_FR') > -1 || osLocale.sync().indexOf('fr_BE') > -1 || osLocale.sync().indexOf('fr_CA') > -1) {
  lang = require('./assets/lang/fr.js')
} else {
  lang = require('./assets/lang/en.js')
}

webview.addEventListener('did-stop-loading', function () {
  document.querySelector('#title-bar-title').innerHTML = 'Shuttle - ' + webview.getTitle().substring(0, 46)
});

// Remove the mouswheel click
(function () {
  function callback (e) {
    e = window.e || e
    if (e.target.localName === 'a') {
      e.preventDefault()
    }
  }

  if (document.addEventListener) {
    document.addEventListener('auxclick', callback, false)
  } else {
    document.attachEvent('onauxclick', callback)
  }
})()

bar.addEventListener('mousewheel', scrollHorizontally, false)

// function to open the url of the webview
function showWebsite (url) {
  console.info('online')
  // if there is http:// or https:// in valu we load the web page
  if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
    $.ajax({
      url: `${url}`,
      context: document.body,
      error: function (jqXHR, exception) {
        webview.loadURL(npath.join('file://', __dirname, '/404.html'))
      },
      success: function () {
        webview.loadURL(url)
      }
    })
  } else if (url.indexOf('http://') === -1) {
    $.ajax({
      url: `http://${url}`,
      context: document.body,
      error: function (jqXHR, exception) {
        webview.loadURL(npath.join('file://', __dirname, '/404.html'))
      },
      success: function () {
        webview.loadURL('http://' + url)
      }
    })
  } else {
    console.log('Error at loading')
  }
}

// Add horizontall scroll for navbar
function scrollHorizontally (e) {
  e = window.event || e
  const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))
  document.documentElement.scrollLeft -= (delta * 40) // Multiplied by 40
  document.body.scrollLeft -= (delta * 40) // Multiplied by 40
  e.preventDefault()
}

// Function for add website
function addWebsite () {
  vex.dialog.open({
    // we ask the url to the user
    message: lang.EnterUrl,
    input: [
      '<input name="URL" type="text" placeholder="http://" required />'
    ].join(''),
    buttons: [
      $.extend({}, vex.dialog.buttons.YES, {text: lang.addButton}),
      $.extend({}, vex.dialog.buttons.NO, {text: lang.CancelButton})
    ],
    callback: function (data) {
      if (data) {
        console.log('URL', data.URL)
        if (!/^https?:\/\//i.test(data.URL)) { // add http protocol to the url to make url-exists
          data.URL = 'http://' + data.URL
        }
        // we open the data.json file
        const save = fs.createWriteStream(path, {
          flags: 'a'
        })

        // we write the json file with the url given by the user
        save.write(',{"web":"' + data.URL + '"}')
        save.end()

        //we set a random id for the new bookmark & avoid duplicates
        do {
          var randomID = Math.floor((Math.random() * 10000) + 1000)
          var idAlreadyExist = $('#' + randomID).length !== 0

        } while( idAlreadyExist )

        // we remove the add button so that the new button does not cover it
        document.querySelector('.add-btn').remove()
        // we add the new button
        $('<a href="#" id="' + randomID + '" class="btn" url="' + data.URL + '" title="' + data.URL + '" onclick=\'showWebsite("' + data.URL + '")\'></a>').appendTo(bar)
        // we set the background-color
        getColor(data.URL, randomID)
        // we add the add button
        $('<a href="javascript:addWebsite()" class="add-btn"></a>').appendTo(bar)
        // we initialize the right-click function
        rightClick()
      }
    }
  })
}

var browser = remote.getCurrentWindow()
webview.addEventListener('enter-html-full-screen', function () {
  browser.setFullScreen(true)
  bar.style.display = 'none'
  webview.style.bottom = '0px'

  if (settings.get('Frame') === true) {
    $(document).find(webview).css('top', '0')
    document.querySelector('.title-bar').remove()
  }
})
webview.addEventListener('leave-html-full-screen', function () {
  browser.setFullScreen(false)
  bar.style.display = 'block'
  webview.style.bottom = '50px'

  if (settings.get('Frame') === true) {
    $(document).find(webview).css('top', '20px')
    $(titlebar).appendTo('body')
    document.querySelector('#title-bar-title').innerHTML = 'Shuttle - ' + webview.getTitle().substring(0, 46)
  }
})

webview.addEventListener('dom-ready', function () {
  webview.insertCSS(`\
              ::-webkit-scrollbar { 
                width: 5px; 
                height: 5px; 
                background-color: white; 
              } 
              
              ::-webkit-scrollbar-thumb { 
                -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3); 
                background-color: #555; 
              } 
              `)
})

// we load the json file
loadJSON(function (response) {
  const link = JSON.parse(response + ']')
  console.log(link)
  updateBar(link)
}, path)

// function to load a json file
function loadJSON (callback, jsonfile) {
  const xobj = new XMLHttpRequest()
  xobj.overrideMimeType('application/json')
  xobj.open('GET', jsonfile, true)
  xobj.onreadystatechange = function () {
    if (xobj.readyState === 4 && xobj.status == '200') {
      callback(xobj.responseText)
    }
  }
  xobj.send(null)
}

// function to set the color of the background with the main the favicon
function getColor (link, key) {
  let url

  if (link === 'changelog.getshuttle.xyz') {
    $(document).find('#0').css('background-image', 'url(./assets/img/shuttle-cr.svg)')
  } else {
    $.ajax({
      url: link,
      async: true,

      error: function () {
        console.warn('ERROR: ' + link)
      },

      success: function (data) {
        const matches = data.match(/<title>(.*?)<\/title>/)

        if (matches == null) {
          $.getJSON(npath.resolve('assets/colors.json'), function (data) {
            for (let i in data) {
              if ('http://' + data[i].url === link) {
                url = 'https://icons.better-idea.org/lettericons/' + link.charAt(7).toUpperCase() + '-64-' + data[i].color.substr(1).slice(0) + '.png'
                console.log('[no proto] color for ' + data[i].url + ' : ' + data[i].color)
                console.log(url + '\n\n')
                $(document).find('#' + key).css('background-image', 'url(' + url + ')')
              } else if ('https://' + data[i].url === link) {
                url = 'https://icons.better-idea.org/lettericons/' + link.charAt(8).toUpperCase() + '-64-' + data[i].color.substr(1).slice(0) + '.png'
                console.log('[no proto] color for ' + data[i].url + ' : ' + data[i].color)
                console.log(url + '\n\n')
                $(document).find('#' + key).css('background-image', 'url(' + url + ')')
              } else if (data[i].url === link) {
                url = 'https://icons.better-idea.org/lettericons/' + link.charAt(0).toUpperCase() + '-64-' + data[i].color.substr(1).slice(0) + '.png'
                console.log('[no proto] color for ' + data[i].url + ' : ' + data[i].color)
                console.log(url + '\n\n')
                $(document).find('#' + key).css('background-image', 'url(' + url + ')')
              }
            }
          })
        } else {
          getColors('https://www.google.com/s2/favicons?domain=' + link.toLowerCase()).then(colors => {
            url = 'https://icons.better-idea.org/lettericons/' + matches[1].charAt(0).toUpperCase() + '-64-' + colors[4].hex().substr(1).slice(0) + '.png'
            console.log('[no json] color for ' + link + ' : ' + colors[4].hex())
            console.log(url + '\n\n')
            $(document).find('#' + key).css('background-image', 'url(' + url + ')')

            // get icon + color
            $.getJSON(npath.resolve('assets/colors.json'), function (data) {
              for (let i in data) {
                if ('http://' + data[i].url === link) {
                  url = 'https://icons.better-idea.org/lettericons/' + matches[1].charAt(0).toUpperCase() + '-64-' + data[i].color.substr(1).slice(0) + '.png'
                  console.log('[no proto] color for ' + data[i].url + ' : ' + data[i].color)
                  console.log(url + '\n\n')
                  $(document).find('#' + key).css('background-image', 'url(' + url + ')')
                } else if ('https://' + data[i].url === link) {
                  url = 'https://icons.better-idea.org/lettericons/' + matches[1].charAt(0).toUpperCase() + '-64-' + data[i].color.substr(1).slice(0) + '.png'
                  console.log('[no proto] color for ' + data[i].url + ' : ' + data[i].color)
                  console.log(url + '\n\n')
                  $(document).find('#' + key).css('background-image', 'url(' + url + ')')
                }
              }
            })
          })
        }
      }
    })
  }
}

// we show the buttons
function updateBar (link) {
  bar.innerHTML = ''
  for (let key in link) {
    $('<a href="#" url="' + link[key].web + '" class="btn" id="' + key + '" title="' + link[key].web + '" onclick=\'showWebsite("' + link[key].web + '")\'></a>').appendTo(bar)
    getColor(link[key].web, key)
  }
  $('<a href="javascript:addWebsite()" class="add-btn"></a>').appendTo(bar)
  rightClick()
}

// function to remove an bookmark with a right click
function rightClick () {
  $('.btn').on('contextmenu', function (e) {
    if (this.id === '0') {
      console.warn('Nope')
    } else {
      const id = this.id
      console.log(id)

      const UrlToRemove = $('#' + id).attr('url')
      console.log(UrlToRemove)
      removeWebsite(id, UrlToRemove)
    }
  })
}

// removing function of bookmark
function removeWebsite (ida, url) {
  vex.dialog.confirm({
    message: lang.Remove + url + lang.FBM,
    buttons: [
      $.extend({}, vex.dialog.buttons.YES, {
        text: lang.ContinueButton
      }),
      $.extend({}, vex.dialog.buttons.NO, {
        text: lang.CancelButton
      })
    ],
    callback: function (value) {
      const id = ida
      if (value) {
        const ButtonToRemove = document.getElementById(id)
        ButtonToRemove.remove()
        replace({
          regex: ',{"web":"' + url + '"}',
          replacement: '',
          paths: ['' + path + ''],
          recursive: true,
          silent: true
        })
      }
    }
  }, vex.closeAll())
}

function closeWindow () {
  console.log('closing')
  windowse.hide()
}

rightClick()

ipcRenderer.on('addframe', (event, arg) => {
  console.log('received')
  if (arg === true) {
    $(document).find(webview).css('top', '20px')
    $(titlebar).appendTo('body')
    document.querySelector('#title-bar-title').innerHTML = 'Shuttle - ' + webview.getTitle().substring(0, 46)
  } else if (arg === false) {
    $(document).find(webview).css('top', '0')
    document.querySelector('.title-bar').remove()
  }
})

if (settings.get('Frame') === true) {
  $(document).find(webview).css('top', '20px')
  $(titlebar).appendTo('body')
} else if (settings.get('Frame') === false) {
  console.info('no frame')
}

console.log('Loaded !')

const view = {
  load () {
    let landingPageUrl = `file://${require('electron').remote.app.getAppPath()}/app/views/changelog.html`.replace(/\\/g,"/")
    this.show(0, landingPageUrl)
  },

  fixUrl (url) {
    return new Promise((resolve) => {
      if (url.includes('https://') || url.includes('http://') || url.includes('file://')) {
        resolve(url)
      } else {
        resolve(`http://${url}`)
      }

      console.log(url)

    })
  },

  create (id, url, type) {
    return new Promise((resolve) => {
      const webViewList = document.querySelector('.views')
      const mobileUserAgent = 'Mozilla/5.0 (Linux; Android 9.0; Pixel XL 2 Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.181 Mobile Safari/537.36'

      this.fixUrl(url).then((url) => {
        if (type === 'addon') {
          webViewList.innerHTML += `<webview src="file://${url}" id="view-${id}" preload="./modules/addonApi.js" onmouseover="controlBar.show(0, false)" class="web-content inactive" useragent="${mobileUserAgent}" disablewebsecurity></webview>`
        } else {
          webViewList.innerHTML += `<webview src="${url}" id="view-${id}" preload="./modules/webviewPreloader.js" onmouseover="controlBar.show(0, false)" class="web-content inactive" useragent="${mobileUserAgent}" disablewebsecurity></webview>`
        }
        this.listenWebViewError(id)
        this.show(id)
        resolve()
      })
    })
  },

  remove (id) {
    let viewToRemove = document.getElementById(`view-${id}`)
    if (viewToRemove) {
      document.getElementById(`view-${id}`).remove()
    }

    this.show(0)
  },

  show (id, url, type) {
    EventsEmitter.emit('SHOW_SETTINGS', false)
    EventsEmitter.emit('SHOW_STORE', false)
    const activeWebView = 'web-content active'
    const inactiveWebView = 'web-content inactive'

    console.log(id)

    if (document.querySelector('.active')) {
      document.querySelector('.active').className = inactiveWebView
    }
    if (!document.querySelector(`#view-${id}`)) {
      this.create(id, url, type).then(() => {
        document.querySelector(`#view-${id}`).className = activeWebView
      })
    } else {
      document.querySelector(`#view-${id}`).className = activeWebView
    }
  },

  generateErrorPage (errorCode) {
    let html = `<!DOCTYPE html><html lang="en"><head> <meta charset="UTF-8"> <title>No internet</title> <style>@font-face{font-family: Light; src: url(../assets/fonts/SourceSanPro-Light.ttf);}html{overflow: hidden; font-family: 'Light';}body{user-select: none;text-align: center; background-color: white;}img{width: 70%; max-width: 200px;}h3{margin-top: 30px; font-family: 'Source Sans Pro Light', sans-serif; font-size: 11.4pt;}.main-content{position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 50%;}</style></head><body><div class="main-content"> <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkNhbHF1ZV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDYwLjQgNTQuOCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjAuNCA1NC44OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlIHR5cGU9InRleHQvY3NzIj4uc3Qwe2ZpbGw6IzAxMDIwMjt9PC9zdHlsZT48ZyBpZD0iWE1MSURfMjk3XyI+PHBhdGggaWQ9IlhNTElEXzMxMV8iIGNsYXNzPSJzdDAiIGQ9Ik0wLDUwLjdjMi40LTEuMSw0LjMtMi41LDUuNi00LjNjMS40LTEuOCwyLTMuOCwyLTYuMWMtMC4yLDAuMS0wLjUsMC4xLTAuOSwwLjFjLTEuNCwwLTIuNS0wLjQtMy41LTEuMmMtMS0wLjgtMS41LTItMS41LTMuNmMwLTEuNSwwLjUtMi43LDEuNS0zLjZjMS0wLjksMi4yLTEuMywzLjctMS4zYzEuOCwwLDMuMiwwLjcsNC4zLDIuMmMxLDEuNSwxLjYsMy41LDEuNiw2YzAsMy43LTEsNi45LTMsOS42Yy0yLDIuNy00LjcsNC44LTguMiw2LjNMMCw1MC43eiBNNi42LDEwLjdDNS4yLDEwLjcsNCwxMC4yLDMsOS4yQzIsOC4yLDEuNSw3LDEuNSw1LjRjMC0xLjYsMC41LTMsMS41LTRDNCwwLjUsNS4yLDAsNi42LDBDOCwwLDkuMiwwLjUsMTAuMiwxLjVjMSwxLDEuNSwyLjMsMS41LDRjMCwxLjUtMC41LDIuOC0xLjUsMy44QzkuMiwxMC4yLDgsMTAuNyw2LjYsMTAuN3oiLz48cGF0aCBpZD0iWE1MSURfMzE0XyIgY2xhc3M9InN0MCIgZD0iTTIwLjcsMTYuNGgxOS42djUuNEgyMC43VjE2LjR6Ii8+PHBhdGggaWQ9IlhNTElEXzMxNl8iIGNsYXNzPSJzdDAiIGQ9Ik00Ny42LDUwLjdjMi40LTEuMSw0LjMtMi41LDUuNi00LjNjMS40LTEuOCwyLTMuOCwyLTYuMWMtMC4yLDAuMS0wLjUsMC4xLTAuOSwwLjFjLTEuNCwwLTIuNS0wLjQtMy41LTEuMmMtMS0wLjgtMS41LTItMS41LTMuNmMwLTEuNSwwLjUtMi43LDEuNS0zLjZjMS0wLjksMi4yLTEuMywzLjctMS4zYzEuOCwwLDMuMiwwLjcsNC4zLDIuMmMxLDEuNSwxLjYsMy41LDEuNiw2YzAsMy43LTEsNi45LTMsOS42Yy0yLDIuNy00LjcsNC44LTguMiw2LjNMNDcuNiw1MC43eiBNNTQuMiwxMC43Yy0xLjQsMC0yLjYtMC41LTMuNi0xLjVjLTEtMS0xLjUtMi4zLTEuNS0zLjhjMC0xLjYsMC41LTMsMS41LTRjMS0xLDIuMi0xLjUsMy42LTEuNWMxLjQsMCwyLjUsMC41LDMuNSwxLjVjMSwxLDEuNSwyLjMsMS41LDRjMCwxLjUtMC41LDIuOC0xLjUsMy44QzU2LjgsMTAuMiw1NS42LDEwLjcsNTQuMiwxMC43eiIvPjwvZz48L3N2Zz4=" alt=""> <h3>${errorCode}</h3></div></body></html>`
    html = 'data:text/html;charset=UTF-8,' + encodeURIComponent(html)
    return html
  },

  listenWebViewError (id) {
    let webviewToListen = document.querySelector(`#view-${id}`)
    if (webviewToListen) {
      webviewToListen.addEventListener('did-fail-load', (errorCode, errorDescription, validatedURL) => {
        if (navigator.onLine === false) {
          webviewToListen.loadURL(this.generateErrorPage('NO INTERNET CONNECTION'))
        } else {
          if (errorCode.errorDescription) {
            webviewToListen.loadURL(this.generateErrorPage(errorCode.errorDescription))
          } else {
            webviewToListen.loadURL(this.generateErrorPage('UNKNOW ERROR'))
          }
        }
      })
      webviewToListen.addEventListener('ipc-message', event => {
        if (event.channel === "OPEN_QUICK_SEARCH") {
          EventsEmitter.emit('OPEN_QUICK_SEARCH', event.args[0])
        } if (event.channel === "PAGE_ALERT") {
          alert(`${event.args[0].site} : ${event.args[0].message}`)
        }
      })

      webviewToListen.addEventListener('enter-html-full-screen', () => {
        this.setFullscreen(true, webviewToListen)
      })
      
      webviewToListen.addEventListener('leave-html-full-screen', () => {
        this.setFullscreen(false, webviewToListen)
      })

    }
  },

  setFullscreen: (bool, view) => {
    let bookmarksBar = document.querySelector('.bar')
    let controlBar = document.querySelector('.control-bar')
    
    require('electron').remote.getCurrentWindow().setFullScreen(bool)

    if (bool) {
      bookmarksBar.style.display = 'none'
      controlBar.style.display = 'none'
      document.querySelector('.add-btn').style.display = 'none'
      view.style.left = '0px'
    } else {
      bookmarksBar.style.display = 'block'
      controlBar.style.display = 'block'
      document.querySelector('.add-btn').style.display = 'block'
      view.style.left = '35px'
      view.executeJavaScript(`
        document.webkitExitFullscreen()
      `)
    }
  }

}

module.exports = view
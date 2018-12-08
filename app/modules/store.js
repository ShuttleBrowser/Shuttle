const config = require('./config.json')

const fs = require('fs')
const http = require('http')
const extractZip = require('extract-zip')

const bookmarks = require('./bookmarks.js')

const userData = require('electron').remote.app.getPath('userData').replace(/\\/g,"/")

let storeIsShow = false

EventsEmitter.on('SHOW_STORE', (bool) => {
  let storeView = document.querySelector('.store')
  if (bool === true) {
    storeView.style.display = 'block'
    storeIsShow = true
  } else if (bool === false) {
    storeView.style.display = 'none'
    storeIsShow = false
  } else {
    if (storeIsShow) {
      storeView.style.display = 'none'
      storeIsShow = false
    } else {
      storeView.style.display = 'block'
      storeIsShow = true
    }
  }
})

const store = {
  popup: {
    install (show, name, description, uuid, type) {
      if (show) {
        let input = [
          `<div class="store-in-app">`,
            `<a href="#" class="store-in-app-close" onclick="store.popup.install(false)"></a>`,
            `<h1 class="store-title">${name.toUpperCase()}</h1>`,
            `<br>`,
            `<br>`,
            `<div class="store-in-app-background" style="background: url(${config.api}/store/assets/${uuid}/banner) no-repeat center; background-size: contain;"></div>`,
            `<div class="store-in-app-content">`,
              `<h4 class="store-in-app-title">${name}</h4>`,
              `<a href="#" onclick="store.install('${uuid}', '${type}')">`,
                `<div class="store-in-app-button">`,
                  `<p class="store-in-app-button-text">ADD TO SHUTTLE</p>`,
                  `<i class="store-in-app-button-icon"></i>`,
                `</div>`,
              `</a>`,
              `<p class="store-in-app-description">${description}</p>`,
              `</div>`,
            `</div>`,
          `<div class="store-popup-overlay"></div>`
        ].join('')
        document.querySelector('.popup').innerHTML = input
        document.querySelector('.store-in-app').style.display = 'block'
      } else {
        document.querySelector('.store-in-app').style.display = 'none'
        document.querySelector('.popup').innerHTML = ''
      }
    },

    search (show) {
      let search = document.querySelector('.store-search')
      let home = document.querySelector('.store-home')

      let searchIcon = document.querySelector('.store-search-icon')
      let searchCloseIcon = document.querySelector('.store-search-close-icon')

      let searchBarValue = document.querySelector('.store-search-bar')
      let appsContainer = document.querySelector('#apps')
      if (show) {
        search.style.display = 'block'
        home.style.display = 'none'

        searchCloseIcon.style.display = 'block'
        searchIcon.style.display = 'none'

        fetch(`${config.api}/store/get/search/shuttle?q=${searchBarValue.value}`).then(res => res.json()).then((data) => {
          appsContainer.innerHTML = ''
          for (i in data) {
            appsContainer.innerHTML = `
              <div class="store-app-collection-item">
                <img class="store-app-collection-item-img" src="${config.api}/store/assets/${data[i].uuid}/icon" alt="">
                <h4 class="store-app-collection-item-name">${data[i].name}</h4>
                <p class="store-app-collection-item-description">${data[i].description}</p>
                <a href="#" class="store-app-collection-item-add-btn" onclick="store.popup.install(true, '${data[i].name}', '${data[i].description}', '${data[i].uuid}', '${data[i].type}')"></a>
              </div>`
          }
        })
      } else {
        search.style.display = 'none'
        home.style.display = 'block'

        searchCloseIcon.style.display = 'none'
        searchIcon.style.display = 'block'
        
        appsContainer.innerHTML = ''
        searchBarValue.value = ''
      }
    }

  },

  runListener () {
    document.querySelector('.store-search-bar').addEventListener('input', () => {
      store.popup.search(true)
    })
  },

  checkAddonsDirectory () {
    return new Promise((resolve, reject) => {
      fs.exists(`${userData}/addons`, (bool) => {

        if (bool === false) {
          fs.mkdir(`${userData}/addons`, { recursive: true }, (err) => {
            if (err) reject(err)

            fs.mkdir(`${userData}/addons/apps`, { recursive: true }, (err) => {
              if (err) reject(err)
  
              fs.mkdir(`${userData}/addons/modules`, { recursive: true }, (err) =>{
                if (err) reject(err)
  
                resolve()
              })
  
            })

          })

        } else {
          resolve()
        }
  
      })
    })
  },

  downloadAddon (uuid, path) {
    return new Promise((resolve, reject) => {

      let iconFile = fs.createWriteStream(`${path}/icon.png`)
      let appFile = fs.createWriteStream(`${path}/app.zip`)

      http.get(`${config.api}/store/assets/${uuid}/icon`, (res) => {
        res.pipe(iconFile)

        res.on('end', () => {

          http.get(`${config.api}/store/action/download/${uuid}`, (res) => {
            res.pipe(appFile)
  
            res.on('end', () => {

              this.unzipAddon(path).then(() => {
                resolve('succes')
              }).catch((e) => {
                console.log(e)
              })

            })
  
            res.on('error', (e) => {
              reject(e)
            })
          })
  
          res.on('error', (e) => {
            reject(e)
          })

        })

      })

    })
  },

  unzipAddon (path) {
    return new Promise((resolve, reject) => {
      extractZip(`${path}/app.zip`, {dir: `${path}/app`}, (err) => {
        if (err) reject(err)
        resolve()
      })
    })
  },

  install (uuid, type) {
    this.checkAddonsDirectory().then(() => {
      let installPath

      if (type === 'app') {
        installPath = `${userData}/addons/apps/${uuid}`
      } else if (type === 'module') {
        installPath = `${userData}/addons/modules/${uuid}`
      }
  
      fs.mkdir(installPath, { recursive: true }, (err) => {
        if (err) alert(err.toString())
      })

      this.downloadAddon(uuid, installPath).then((result) => {
        fs.unlinkSync(`${installPath}/app.zip`)
        bookmarks.addBookmarksInUI(`${uuid}`, `${installPath}/icon.png`, `${installPath}/app/index.html`, 'addon')
      }).catch((e) => {
        alert(e)
      })
    })
  }
}

module.exports = store
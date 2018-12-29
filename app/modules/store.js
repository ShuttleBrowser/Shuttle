// import config file
const config = require('./config.json')

// import modules to make store working
const { app } = require('electron').remote
const fs = require('fs')
const extract = require('extract-zip')
const files = require('./files.js')
const lang = require('../../lang/lang.js')

// This object encloses all that is necessary to manage the addons
const addons = {
  installApp (uuid) {
    return new Promise((resolve) => {

      if (this.utils.isInstalled(uuid) === false) {

        this.utils.checkDirectorie(uuid).then(() => {
          this.installation.download(uuid).then(() => {
            this.installation.decompress(uuid).then(() => {
              this.ui.add(uuid)
              this.installation.addInFile(uuid)
              resolve()
            })
          })
        })
  
      }

    })
  },

  uninstallApp (uuid) {
    return new Promise(resolve => {
      Promise.all([
        this.ui.remove(uuid),
        this.uninstall.removeInFile(uuid),
        this.uninstall.removeDirectory(uuid)
      ]).then(() => {
        resolve()
      })
    })
  },

  // util section
  utils: {
    // userdate "C:/Users/username/AppData/Roaming/Shuttle" on windows
    userData: app.getPath('userData').replace(/\\/g,"/"),

    // Function to get addons install path
    getAddonPath (uuid) {
      return `${this.userData}/addons/${uuid}`
    },

    // Check if addons is already installed
    isInstalled (uuid) {
      if (files.apps.get().filter({id: `${uuid}`}).value().length >= 1) {
        return true
      } else {
        return false
      }
    },

    // check if addon directory exist
    checkDirectorie (uuid) {
      return new Promise(resolve => {
    
        require('mkdirp')(this.getAddonPath(uuid), (err) => {
          if (err) {
            console.error(err)
          } else {
            resolve()
          }
        })

      })
    },

    requireHttp () {
      if (config.api.includes('https://')) {
        return require('https')
      } else {
        return require('http')
      }
    }
  },

  // section where we interact with the user interface
  ui: {
    // ad addon in ui
    add (uuid) {
      let args = {
        icon: `http://localhost:57661/${uuid}/icon`,
        url: `http://localhost:57661/${uuid}`
      }

      require('./bookmarks.js').addBookmarksInUI(uuid, args.icon, args.url, 'app')
    },

    // remove add in ui
    remove (uuid) {
      require('./bookmarks.js').removeBookmarkInUI(uuid, 'app')
    }
  },

  // In this section we have all the functions that allow the installation of addons
  installation: {

    // download all files
    download (uuid) {
      return new Promise((resolve) => {
        addons.utils.requireHttp().get(`${config.api}/store/assets/${uuid}/icon`, (res) => {
          res.pipe(fs.createWriteStream(`${addons.utils.getAddonPath(uuid)}/icon.png`))
        })
  
        addons.utils.requireHttp().get(`${config.api}/store/action/download/${uuid}`, (res) => {
          res.pipe(fs.createWriteStream(`${addons.utils.getAddonPath(uuid)}/app.zip`))
  
          res.on('end', () => {
            resolve()
          })
        })
      })
    },

    // decompress app.zip in to app folder
    decompress (uuid) {
      return new Promise((resolve, reject) => {
        extract(`${addons.utils.getAddonPath(uuid)}/app.zip`, {
          dir: `${addons.utils.getAddonPath(uuid)}/app`
        }, () => {
          resolve()
        })
      })
    },

    // add addon in file
    addInFile (uuid) {
      return new Promise((resolve, reject) => {
        const appList = files.apps.list()

        if (appList.length === 0) {
          order = 1
        } else {
          order = appList[appList.length - 1].order + 1
        }
  
        files.apps.push({
          id: `${uuid}`,
          url: `http://localhost:57661/${uuid}`,
          icon: `http://localhost:57661/${uuid}/icon`,
          type: 'app',
          order: 9999 + order
        })
      })
    }
  },

  // In this section we have all the functions that allow the uninstallation of the addons
  uninstall: {

    // remove addon in file
    removeInFile (uuid) {
      files.apps.remove({
        id: uuid
      })
    },

    // remove addon directory
    removeDirectory (uuid) {
      return new Promise((resolve, reject) => {
        require('rmdir')(addons.utils.getAddonPath(uuid), (err, dir, files) => {
          if (err) {
            console.log(err)
            resolve()
          }
        })
      })
    }
  }
}

let store = {
  front: {
    // select the store home page
    home: document.querySelector('.store-home'),
    // select the search bar
    searchBar: document.querySelector('.store-search-bar'),
    // select the search result
    searchResult: document.querySelector('.store-search'),
    // select app container in search result
    appContainer: document.querySelector('#apps'),
    // select the store
    storeView: document.querySelector('.store'),
    // the store is show ?
    storeIsShow: false,

    modal: {
      showAppInstallation (show, uuid, name, description) {
        const modalContainer = document.querySelector('#store-modal-container')
        const modalTitle = document.querySelector('#store-modal-title')
        const modalBanner = document.querySelector('#store-modal-banner')
        const modalAppName = document.querySelector('#store-modal-app-name')
        const modalAppDescription = document.querySelector('#store-modal-description')
  
        if (show) {
          modalContainer.style.display = 'block'
  
          modalTitle.innerHTML = name.toUpperCase()
          modalBanner.setAttribute('style', `background: url(${config.api}/store/assets/${uuid}/banner) no-repeat center; background-size: contain;`)
          modalAppName.innerHTML = name
          modalAppDescription.innerHTML = description
          this.setButtonTo(addons.utils.isInstalled(uuid), uuid)
        } else {
          modalContainer.style.display = 'none'
        }
      },

      setButtonTo (action, uuid) {
        const modalButton = document.querySelector('#store-action-button')
        const modalButtonText = document.querySelector('#store-modal-button-text')

        if (action === true) {
          modalButton.setAttribute('onclick', `store.front.modal.install(true, '${uuid}')`)
          modalButtonText.innerHTML = lang('STORE_UNINSTALL_ADDON')
          console.log('finish')
        } else if (action === false) {
          modalButton.setAttribute('onclick', `store.front.modal.install(false, '${uuid}')`)
          modalButtonText.innerHTML = lang('STORE_ADD_ADDON')
        } else {
          modalButton.setAttribute('onclick', '')
          modalButtonText.innerHTML = 'INSTALLING...'
        }
      },

      install (bool, uuid) {
        this.setButtonTo('loading', uuid)

        if (bool) {
          addons.installApp(uuid).then(() => {
            this.setButtonTo(true, uuid)
          })
        } else {
          addons.uninstallApp(uuid).then(() => {
            this.setButtonTo(false, uuid)
          })
        }
      }

    },

    items: {
      injectInCollection (content, data) {
        content.innerHTML = ''
        for (i in data) {
          let itemID = `item-${data[i].uuid}-${Math.floor(Math.random() * (1000 - 1) + 1)}`

          content.innerHTML += `
          <div class="store-app-collection-item">
            <img class="store-app-collection-item-img" src="${config.api}/store/assets/${data[i].uuid}/icon" alt="">
            <a href="#" class="store-app-collection-item-name" onclick="store.front.modal.showAppInstallation(true, '${data[i].uuid}', '${data[i].name}', '${data[i].description.replace(/[\']+/, '&quot;')}')">${data[i].name}</a>
            <p class="store-app-collection-item-description">${data[i].description.substring(0, 60)}</p>
            <a href="#" id="${itemID}" class="store-app-collection-item-add-btn" onclick="store.front.items.install(true, '${data[i].uuid}', '${itemID}')"></a>
          </div>
          `

          this.setButtonTo(addons.utils.isInstalled(data[i].uuid), data[i].uuid, itemID)
        }
      },

      setButtonTo (action, uuid, item) {
        const itemButton = document.querySelector(`#${item}`)

        if (action === true) {
          itemButton.setAttribute('onclick', `store.front.items.install(false, '${uuid}', '${item}')`)
          itemButton.style.transform = 'rotate(45deg)'
          itemButton.setAttribute('class', 'store-app-collection-item-add-btn')
        } else if (action === false) {
          itemButton.setAttribute('onclick', `store.front.items.install(true, '${uuid}', '${item}')`)
          itemButton.style.transform = 'rotate(0deg)'
        } else {
          itemButton.setAttribute('onclick', '')
          itemButton.style.transform = 'rotate(0deg)'
          itemButton.setAttribute('class', 'store-app-collection-item-add-btn rotating')
        }
      },

      install (bool, uuid, item) {
        this.setButtonTo('loading', uuid, item)

        if (bool) {
          addons.installApp(uuid).then(() => {
            this.setButtonTo(true, uuid, item)
          })
        } else {
          addons.uninstallApp(uuid).then(() => {
            this.setButtonTo(false, uuid, item)
          })
        }
      }

    },

    showSearchResults (show) {
      const searchIcon = document.querySelector('.store-search-icon')
      const searchCloseIcon = document.querySelector('.store-search-close-icon')
      const searchResult = document.querySelector('.store-search')
      const home = document.querySelector('.store-home')
      const appContainer = document.querySelector('#apps')
      const searchBar = document.querySelector('.store-search-bar')

      if (show) {
        searchResult.style.display = 'block'
        home.style.display = 'none'

        searchCloseIcon.style.display = 'block'
        searchIcon.style.display = 'none'
      } else {
        searchResult.style.display = 'none'
        home.style.display = 'block'

        searchCloseIcon.style.display = 'none'
        searchIcon.style.display = 'block'

        appContainer.innerHTML = ''
        searchBar.value = ''
      }
    },

    trending: {

      load () {
        let trendingApp = document.querySelector('.store-trending-app')
    
        store.back.trending().then(data => {
          trendingApp.style.backgroundImage = `url(${data.banner})`
          this.setButtonTo(addons.utils.isInstalled(data.uuid), data.uuid)
        })  
      },

      setButtonTo (uninstall, uuid) {
        let trendingButton = document.querySelector('.store-trending-add-button')
        let trendingButtonText = document.querySelector('.store-trending-add-button-text')

        if (uninstall) {
          trendingButtonText.innerHTML = lang('STORE_UNINSTALL_ADDON')
          trendingButton.setAttribute('onclick', `store.install(true, '${uuid}')`)
        } else {
          trendingButtonText.innerHTML = lang('STORE_ADD_ADDON')
          trendingButton.setAttribute('onclick', `store.install(false, '${uuid}')`)
        }
      },

      install (bool, uuid) {
        if (bool) {
          addons.installApp(uuid)
          this.setButtonTo(true, uuid)
        } else {
          addons.uninstallApp(uuid)
          this.setButtonTo(false, uuid)
        }
      }

    }
  },

  back: {
    search (words) {
      const appContainer = document.querySelector('#apps')

      fetch(`${config.api}/store/get/search/shuttle?q=${words}`).then(res => res.json()).then((data) => {
        store.front.items.injectInCollection(appContainer, data)
      })
    },

    recent () {
      const recently = document.querySelector('#recently')
      fetch(`${config.api}/store/get/recent`).then(res => res.json()).then((data) => {
        store.front.items.injectInCollection(recently, data)
      })
    },

    trending () {
      return new Promise(resolve => {
        fetch(`${config.api}/store/get/trending`).then(res => res.json()).then((data) => {
          resolve(data)
        })
      })
    },

    runListener () {
      document.querySelector('.store-search-bar').addEventListener('input', () => {
        store.front.showSearchResults(true)
        this.search(document.querySelector('.store-search-bar').value)
      })
    }
  }
}

// when receive SHOW_STORE event
EventsEmitter.on('SHOW_STORE', (bool) => {
  storeView = document.querySelector('.store')
  storeIsShow = store.front.storeIsShow

  if (bool === true) {
    store.back.recent()
    store.front.trending.load()
    storeView.style.display = 'block'
    storeIsShow = true
  } else if (bool === false) {
    storeView.style.display = 'none'
    storeIsShow = false
  } else {
    if (addons.utils.storeIsShow) {
      storeView.style.display = 'none'
      storeIsShow = false
    } else {
      store.back.recent()
      store.front.trending.load()
      storeView.style.display = 'block'
      storeIsShow = true
    }
  }
})

module.exports = {
  addons,
  store
}
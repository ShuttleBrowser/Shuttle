const config = require('./config.json')

const files = require('./files.js')
const store = require('./store.js')

const sync = {

  syncBookmarks () {
    return new Promise((resolve, reject) => {

      let isLogged = files.settings.getValue('settings.isLogged')

      if (isLogged && files.settings.getValue('settings.sync')) {

        let body = {
          token: files.settings.getValue('settings.userToken')
        }

        fetch(`${config.api}/sync/bookmarks/download/`, {
          method: 'post',
          body: JSON.stringify(body),
          headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json()).catch(() => {
          reject()
        }).then((data) => {
            if (data.message === 'success') {
              resolve(data.bookmarks)
              files.bookmarks.set(data.bookmarks)
            } else if (data.message === 'TOKEN_ERROR' || data.message === 'USER_NOT_FOUND') {
              reject()
            } else {
              reject()
            }
          })

      } else {
        reject()
      }

    })
  },

  uploadBookmarks () {

    return new Promise((resolve, reject) => {

      let isLogged = files.settings.getValue('settings.isLogged')

      if (isLogged && files.settings.getValue('settings.sync')) {

        let body = {
          token: files.settings.getValue('settings.userToken'),
          bkms: files.bookmarks.list()
        }

        fetch(`${config.api}/sync/bookmarks/upload/`, {
          method: 'post',
          body: JSON.stringify(body),
          headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json()).catch(() => {
          reject()
        }).then((data) => {
            if (data.message === 'success') {
              resolve(data.bookmarks)
            } else if (data.message === 'TOKEN_ERROR' || data.message === 'USER_NOT_FOUND') {
              reject()
            } else {
              reject()
            }
          })

      } else {
        reject()
      }

    })

  }

}

module.exports = sync
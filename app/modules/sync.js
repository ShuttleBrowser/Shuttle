const config = require('./config.json')

const files = require('./files.js')
const store = require('./store.js')
const GoogleDriveService = require('./gd-service.js')

const service = new GoogleDriveService();
const SAVE_BOOKMARK_KEY = "bookmarks_save_id"

const sync = {

  syncBookmarks () {
    return new Promise((resolve, reject) => {

      let isLogged = files.settings.getValue('settings.isLogged')

      if (isLogged && files.settings.getValue('settings.sync')) {

        service.getFileContent(SAVE_BOOKMARK_KEY)
        .catch(function(err){
          reject(err)
        })
        .then(function(response){
          resolve(response)
        })

      } else {
        reject()
      }

    })
  },

  uploadBookmarks () {
    let isLogged = files.settings.getValue('settings.isLogged')

    if (isLogged && files.settings.getValue('settings.sync')) {

      service.upload(JSON.stringify(files.bookmarks.list()), 'bookmarks.shuttle', 'Shuttle app bookmarks')
      .then(function (response) {
        service.saveFileId(SAVE_BOOKMARK_KEY, response.id)
      })
      .catch(function (err) {
        console.error('[SYNC] > ' + err)
      })

    } else {
      console.error('[SYNC] > User not logged in or not synced')
    }
  }

}

module.exports = sync
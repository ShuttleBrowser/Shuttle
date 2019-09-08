const config = require('./config.json')

const files = require('./files.js')
const store = require('./store.js')
const GoogleDriveService = require('./gd-service.js')
const { SAVE_BOOKMARK_KEY } = require('../../main/secrets');

const service = new GoogleDriveService();

const sync = {

  syncBookmarks () {
    return new Promise((resolve, reject) => {

      if (files.settings.getValue('settings.isLogged') && files.settings.getValue('settings.sync')) {

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

      const id = service.getFileId(SAVE_BOOKMARK_KEY);

      if(id === undefined) {
        service.findfile('bookmarks.shuttle')
        .then(function (response) {
          if(response.kind === "drive#file") {
            // update the file
            service.saveFileId(SAVE_BOOKMARK_KEY, response.id)
            service.update(response.id, JSON.stringify(files.bookmarks.list()))
          } else if(response.kind === "drive#fileList") {
            // if it is a file list

            // if the length of this list is null, then upload
            if(response.files.length == 0) {
              service.upload(JSON.stringify(files.bookmarks.list()), 'bookmarks.shuttle', 'Shuttle app bookmarks')
              .then(function (response) {
                service.saveFileId(SAVE_BOOKMARK_KEY, response.id)
              })
              .catch(function (err) {
                console.error('[SYNC] > ' + err)
              })
            } else {
              // take the first file
              service.saveFileId(SAVE_BOOKMARK_KEY, response.files[0].id)
              service.update(response.files[0].id, JSON.stringify(files.bookmarks.list()))
            }
          }
        })
        .catch(function(err){
          console.error(err)
        })
      } else {
        service.update(id, JSON.stringify(files.bookmarks.list()))
      }

    } else {
      console.error('[SYNC] > User not logged in or not synced')
    }
  }

}

module.exports = {
  sync
}
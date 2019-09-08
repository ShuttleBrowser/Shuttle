const fs = require('fs')
const { ipcRenderer } = require('electron')
const mime = require('mime')
const Store = require('electron-store')

const store = new Store();

class GoogleDriveService {
  getCredentials () {
    return ipcRenderer.sendSync('get-credentials')
  }
  
  upload (json, newfilename, description = '') {
    // https://developers.google.com/drive/api/v3/manage-uploads#simple

    let credentials = this.getCredentials()
    const that = this;

    /* global fetch */ /* eslint no-undef: "error" */
    return new Promise((resolve, reject) => {
      if(!!credentials) {
        fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=media', {
          method: 'POST',
          headers: {
            Authorization: `${credentials.token_type} ${credentials.access_token}`,
            'Content-Type': 'application/json',
            'Content-Length': json.length
          },
          body: json
        })
        .catch(function(err) {
          reject(err)
        })
        .then(function (response) {
          return response.json()
        })
        .then(function(data) {
          if('id' in data) {
            that.rename(data.id, newfilename, description)
            .catch(function(err) {
              reject(err)
            })
            .then(function(response) {
              resolve({
                id: data.id
              })
            })
          }
        })
      } else {
        reject('null credentials :(.')
      }
    })
  }

  rename(id, newname, description) {
    let credentials = this.getCredentials()
    
    /* global fetch */ /* eslint no-undef: "error" */
    return fetch('https://www.googleapis.com/drive/v3/files/' + id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${credentials.token_type} ${credentials.access_token}`
      },
      body: JSON.stringify({ name: newname, description : description })
    })
  }

  getFileContent(name) {
    return new Promise((resolve, reject) => {
      if(store.has(name)) {
        const id = store.get(name)
        let credentials = this.getCredentials()
  
        return fetch('https://www.googleapis.com/drive/v3/files/' + id + '?alt=media', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${credentials.token_type} ${credentials.access_token}`
          }
        })
        .catch(function (err) {
          reject(err)
        })
        .then(function(response) {
          console.log(response);
          return response.json();
        })
        .then(function(data) {
          resolve(data)
        })
      }

      reject('no file named ' + name);
    })
  }

  saveFileId(name, id) {
    store.set(name, id)
  }
}

module.exports = GoogleDriveService

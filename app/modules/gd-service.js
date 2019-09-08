const fs = require('fs')
const { ipcRenderer } = require('electron')
const mime = require('mime')
const Store = require('electron-store')

const store = new Store();

class GoogleDriveService {
  getCredentials () {
    return ipcRenderer.sendSync('get-credentials')
  }

  findfile(query) {
    // https://developers.google.com/drive/api/v3/reference/files/list

    let credentials = this.getCredentials()

    let url = new URL('https://www.googleapis.com/drive/v3/files')
    url.searchParams.set('corpora', 'user')
    url.searchParams.set('q', 'name = "' + query + '" and trashed = false')
    //url.searchParams.set('orderBy', 'modifiedTime')

    return new Promise((resolve, reject) => {
      if(!!credentials) {
        fetch(url.toString(), {
          method: 'GET',
          headers: {
            Authorization: `${credentials.token_type} ${credentials.access_token}`
          }
        })
        .catch(function(err){
          reject(err)
        })
        .then(function (response) {
          return response.json()
        })
        .then(function(data) {
          resolve(data)
        })
      } else {
        reject ('null credentials :(.')
      }
    })
  }
  
  upload (json, newfilename, description = '') {
    // https://developers.google.com/drive/api/v3/manage-uploads#simple

    let credentials = this.getCredentials()
    const that = this;

    console.log('[GD-SERVICE] > uploading file')

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
    // https://developers.google.com/drive/api/v3/reference/files/update
    let credentials = this.getCredentials()

    console.log('[GD-SERVICE] > renaming file')
    
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

  update(id, json) {
    // https://developers.google.com/drive/api/v3/reference/files/update
    let credentials = this.getCredentials()
    
    /* global fetch */ /* eslint no-undef: "error" */
    return fetch('https://www.googleapis.com/upload/drive/v3/files/' + id + '?uploadType=media', {
      method: 'PATCH',
      headers: {
        'Authorization' : `${credentials.token_type} ${credentials.access_token}`,
        'Content-Type'  : 'application/json',
        'Content-Length': json.length
      },
      body: json
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
            Authorization: `${credentials.token_type} ${credentials.access_token}`,
            'Content-Type': 'application/json'
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

  getFileId(name) {
    return store.get(name, undefined)
  }
}

module.exports = GoogleDriveService

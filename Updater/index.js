const DecompressZip = require('decompress-zip')
const request = require('request')
const appVersion = require('../package.json').version
const fs = require('fs')
const path = require('path')
const osLocale = require('os-locale')
const electron = require('electron')
const settings = require('electron-settings')

const updateZip = new DecompressZip(path.resolve('/update.zip'))

function downloadFile (configuration) {
  return new Promise(function (resolve, reject) {
    // Save variable to know progress
    let receivedBytes = 0
    let totalBytes = 0

    const req = request({
      method: 'GET',
      uri: configuration.remoteFile
    })

    const out = fs.createWriteStream(configuration.localFile)
    req.pipe(out)

    req.on('response', function (data) {
      // Change the total bytes value to get progress later.
      totalBytes = parseInt(data.headers['content-length'])
    })

    // Get progress if callback exists
    if (configuration.hasOwnProperty('onProgress')) {
      req.on('data', function (chunk) {
        // Update the received bytes
        receivedBytes += chunk.length

        configuration.onProgress(receivedBytes, totalBytes)
      })
    } else {
      req.on('data', function (chunk) {
        // Update the received bytes
        receivedBytes += chunk.length
      })
    }

    req.on('end', function () {
      resolve()
    })
  })
}

function dlupdate (u) {
  request('http://' + u + '.getshuttle.xyz/updates.txt', function (error, response, body) {
    if (error) {
      console.log('Error for checking update')
    } else if (response) {
      if (body !== appVersion) {
        console.log('Download...')
        downloadFile({
          remoteFile: 'http://' + u + '.getshuttle.xyz/Latest.zip',
          localFile: path.resolve('update.zip'),
          onProgress: function (received, total) {
            const percentage = (received * 100) / total
            console.log(Math.round(percentage) + '% - ' + u + '.getshuttle.xyz')
          }
        }).then(function () {
          console.log('Download finished')
          console.log('Extacting...')
          updateZip.extract({
            path: path.resolve('../'),
            filter: function (file) {
              return file.type !== 'SymbolicLink'
            }
          })
          console.log('Extacted')
          if (osLocale.sync().indexOf('fr_FR') > -1 || osLocale.sync().indexOf('fr_BE') > -1 || osLocale.sync().indexOf('fr_CA') > -1) {
            electron.dialog.showMessageBox({
              title: 'Shuttle',
              type: 'info',
              message: 'Une mise à jour a été téléchargée, veuillez redémarrer l\'application pour avoir accès aux nouvelles fonctionnalités.',
              buttons: ['Close']
            })
          } else if (osLocale.sync() === 'en_US' || osLocale.sync() === 'en_EN') {
            electron.dialog.showMessageBox({
              title: 'Shuttle',
              type: 'info',
              message: 'Please restart shuttle to apply the update.',
              buttons: ['Close']
            })
          } else {
            electron.dialog.showMessageBox({
              title: 'Shuttle',
              type: 'info',
              message: 'Please restart shuttle to apply the update.',
              buttons: ['Close']
            })
          }
        })
      }
    }
  })

}

exports.updateAndInstall = function () {
  // we get the json file

  if (settings.get('DevMod') === true) {
    dlupdate('back')
    console.log('Dev Mode = OK')
  } else {
    dlupdate('update')
  }

}
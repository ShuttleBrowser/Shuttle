const http = require('http')
const unzip = require('unzip')
const fs = require('fs')
const path = require('path')
const request = require('request')

// updateAndInstall();
// function updateAndInstall() {

exports.updateAndInstall = function () {
  request('http://update.getshuttle.xyz/updates.json', function (error, response, body) {
    if (error) {
      throw error
    }
    if (body !== fs.readFileSync(path.resolve('version.txt'), 'utf8')) {
      console.log('\n######################################\n')
      console.log('Update availible !\n')

      const UpdateFile = fs.createWriteStream(path.resolve('Update.zip'))
      http.get('http://update.getshuttle.xyz/Latest.zip', function (response) {
        response.pipe(UpdateFile)
        console.log('Download complete')
        console.log('Extract...\n')
        fs.createReadStream(path.resolve('Update.zip')).pipe(unzip.Extract({path: './'}))
        console.log('Extract complete !\n')
        writefile(body)
        console.log('Update complete !\n')
        console.log('######################################\n')
      })
    } else {
      console.log('no-update')
    }
  })

  function writefile (version) {
    fs.writeFile(path.resolve('version.txt'), version, function (err) {
      if (err) {
        return console.log(err)
      }
    })
  }

  // function sleep (milliseconds) {
  //   const start = new Date().getTime()
  //   for (let i = 0; i < 1e7; i++) {
  //     if ((new Date().getTime() - start) > milliseconds) {
  //       break
  //     }
  //   }
  // }
}

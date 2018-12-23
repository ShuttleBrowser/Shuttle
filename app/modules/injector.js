const fs = require('fs')
const path = require('path')
const appContent = document.querySelector('#app')

module.exports = (view, content , callback) => {
  return new Promise((resolve) => {
    let filePath = path.resolve(`${__dirname}/../views/${view}.html`)

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) throw err
      if (content) {
        document.querySelector(content).innerHTML = data
      } else {
        appContent.innerHTML = data
      }
      resolve()

      if(callback) {
        callback()
      }
    })
  }) 
}
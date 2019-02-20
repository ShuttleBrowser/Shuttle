const fs = require('fs')
const { app, shell } = require('electron').remote
const modales = require('./modales.js')

const controlBar = {
  goBack () {
    let view = document.querySelector(`.active`)
    if (view.canGoBack()) {
      view.goBack()
    }
  },

  goForward () {
    let view = document.querySelector(`.active`)
    if (view.canGoForward()) {
      view.goForward()
    }
  },

  reload () {
    let view = document.querySelector(`.active`)
    view.reload()
  },

  makeScreenshot: () => {
    let view = document.querySelector(`.active`).getWebContents()
    view.capturePage((data) => {
      let img = data.toPNG().toString('base64')
      let path = `${app.getPath('pictures')}/screenshot-ID${Math.floor((Math.random() * 10000) + 1)}.png`

      fs.writeFile(path, img.replace(/^data:image\/png;base64,/, ''), 'base64', (err) => {
        if (err) throw err
      })

      modales.screenshot(() => {
        shell.showItemInFolder(path)
      })

    })
  },

  show (id, show) {
    let bookmarksTop = window.event.clientY
    if (show) {
      document.querySelector('.control-bar').style.display = 'block'
      if (id >= 14) {
        document.querySelector('.control-bar').style.top = `${bookmarksTop - 10}px`
      } else {
        document.querySelector('.control-bar').style.top = `${document.querySelector(`#id-${id}`).offsetTop + document.querySelector('.nav-zone').offsetTop - 1}px`
      }
    } else {
      document.querySelector('.control-bar').style.display = 'none'
      document.querySelector('.control-bar').style.top = `0px`
    }
  }
}

module.exports = controlBar
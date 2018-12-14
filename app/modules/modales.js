const lang = require('../../lang/lang.js')
const bookmarks = require('./bookmarks.js')
const quickSearch = require('./quickSearch.js')
const { ipcRenderer } = require('electron')

const modales = {
  createNewBookmark () {
    let inputs = []
    inputs.push(
      '<div class="vex-custom-field-wrapper">',
      '<div class="vex-custom-radio">',
      '<input type="radio" name="action" checked value="radioURL" id="radioURL"><label for="radioURL">' + lang('TYPE_URL') + '</label><br>',
      '</div>',
      '<div class="vex-custom-input-wrapper">',
      '<input name="inputURL" type="text" value="" id="inputURL" placeholder="http://" />',
      '</div>',
      '</div>')

    inputs.push(
      '<div class="vex-custom-radio">',
      '<input type="radio" name="action" value="radioCurrent" id="radioCurrent"><label for="radioCurrent">' + lang('CHOOSE_THIS_URL') + '</label><br>',
      '</div>')

    vex.dialog.buttons.YES.text = lang('CONTINUE_BUTTON')
    vex.dialog.buttons.NO.text = lang('CANCEL_BUTTON')
    vex.dialog.open({
      message: lang('ADD_BOOKMARK'),
      input: inputs.join(''),
      callback: (data) => {
        if (data) {
          let url = ('inputURL' in data) ? data.inputURL : document.querySelector('.active').getURL()
          bookmarks.createBookmark(url)
        }
      }
    })
  },

  removeBookmark (id, url) {
    vex.dialog.buttons.YES.text = lang('CONTINUE_BUTTON')
    vex.dialog.buttons.NO.text = lang('CANCEL_BUTTON')
    vex.dialog.confirm({
      message: `${lang('REMOVE_BOOKMARK')} : ${url}`,
      callback: (bool) => {
        if (bool) {
          bookmarks.removeBookmark(id)
          console.log(id)
        }
      }
    })
  },

  quickSearch () {
    vex.dialog.buttons.YES.text = lang('SEARCH_BUTTON')
    vex.dialog.buttons.NO.text = lang('CANCEL_BUTTON')
    vex.dialog.prompt({
      message: lang('QUICK_SEARCH'),
      placeholder: lang('SEARCH_BUTTON'),
      callback: (value) => {
        if (value) {
          quickSearch(value)
        }
        vex.dialog.buttons.YES.text = 'Ok'
      }
    })
  },

  screenshot (callback) {
    vex.dialog.buttons.YES.text = 'Ok'
    vex.dialog.buttons.NO.text = 'openFolder'
    vex.dialog.confirm({
      message: lang('SCREENSHOT_DONE'),
      callback: (value) => {
        if (value) {
          return
        } else {
          callback()
        }
        vex.dialog.buttons.YES.text = 'Ok'
        vex.dialog.buttons.NO.text = 'Cancel'
      }
    })
  },

  alert (message) {
    vex.dialog.open({
      message: message,
    })
  }
}

module.exports = modales
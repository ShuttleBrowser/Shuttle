const lang = require('../../lang/lang.js')
const bookmarks = require('./bookmarks.js')
const quickSearch = require('./quickSearch.js')
const files = require('./files.js')
const { ipcRenderer } = require('electron')

const modales = {
  createNewBookmark () {
    let inputs = []
    inputs.push(
      '<div class="vex-custom-field-wrapper">',
      '<div class="vex-custom-radio">',
      '<input type="radio" name="action" checked value="radioURL" id="radioURL"><label for="radioURL"><span></span><div>' + lang('TYPE_URL') + '</div></label><br>',
      '</div>',
      '<div class="vex-custom-input-wrapper">',
      '<input name="inputURL" type="text" value="" id="inputURL" placeholder="http://" />',
      '</div>',
      '</div>')

    inputs.push(
      '<div class="vex-custom-radio">',
      '<input type="radio" name="action" value="radioCurrent" id="radioCurrent"><label for="radioCurrent"><span></span><div>' + lang('CHOOSE_THIS_URL') + '</div></label><br>',
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

    let message

    if (String(id).includes('quickSearch')) {
      message = lang('REMOVE_QUICKSEARCH')
    } else {
      message = `${lang('REMOVE_BOOKMARK')}: ${require('url').parse(url).hostname}`
    }

    vex.dialog.confirm({
      message: message,
      callback: (bool) => {
        if (bool) {
          bookmarks.removeBookmark(id)
          console.log(id)
        }
      }
    })
  },

  feedback (callback) {
    let inputs = []
    inputs.push(
        '<div class="vex-custom-field-wrapper">',
          '<div class="vex-custom-input-wrapper">',
            '<input name="email" type="text" value="" id="email" placeholder="yourmail@mail.com" />',
            '<textarea name="description" type="text" value="" id="description" placeholder="Description" style="resize: vertical;"></textarea>',
          '</div>',
        '</div>'
      )

    vex.dialog.buttons.YES.text = lang('CONTINUE_BUTTON')
    vex.dialog.buttons.NO.text = lang('CANCEL_BUTTON')
    vex.dialog.open({
      message: lang('SETTINGS_REPORT_BUG'),
      input: inputs.join(''),
      callback: (data) => {
        if (data) {
          callback(data.email, data.description)
        }
      }
    })
  },

  quickSearch () {
    vex.dialog.buttons.YES.text = lang('SEARCH_BUTTON')
    vex.dialog.buttons.NO.text = lang('CANCEL_BUTTON')
    vex.dialog.prompt({
      message: lang('QUICK_SEARCH'),
      placeholder: files.settings.getValue('settings.searchEngine') + ' ' + lang('SEARCH_BUTTON'),
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
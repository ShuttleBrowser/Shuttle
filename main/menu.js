const { Menu } = require('electron')
const lang = require('../lang/lang.js')

module.exports = Menu.buildFromTemplate([
  // show shuttle btn
  {
    label: lang('SHOW_SHUTTLE_BUTTON'),
    click () {
      EventsEmitter.emit('SHOW_SHUTTLE')
    }
  },

  // about btn
  {
    label: lang('ABOUT_BUTTON'),
    click () {
      // We open the website at about
      EventsEmitter.emit('SHOW_ABOUT')
    }
  },

  // Settings btn
  {
    label: lang('SETTINGS_BUTTON'),
    click () {
      EventsEmitter.emit('SHOW_SETTINGS')
      EventsEmitter.emit('SHOW_SHUTTLE')
    }
  },

  // wow, a separator !
  {type: 'separator'},

  // quit btn :(
  {
    label: lang('QUIT_BUTTON'),
    click () {
      EventsEmitter.emit('QUIT_SHUTTLE')
    }
  }
])
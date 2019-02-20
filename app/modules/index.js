const loadFile = require('./injector.js')
const event = require('./events.js')
const bookmarks = require('./bookmarks.js')
const files = require('./files.js')
const view = require('./views.js')
const auth = require('./auth.js')
const settings = require('./settings.js')
const controlBar = require('./controlbar.js')
const modales = require('./modales.js')
const { store, addons, updater } = require('./store.js')
const sync = require('./sync.js')

module.exports = {
  loadFile,
  event,
  bookmarks,
  files,
  view,
  auth,
  settings,
  controlBar,
  modales,
  store,
  addons,
  updater,
  sync
}
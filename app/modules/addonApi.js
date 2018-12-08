const { modales, files, bookmarks } = require('./index.js')

window.alert = (message) => {
  modales.alert(message)
}
const view = require('./views.js')
const bookmarks = require('./bookmarks.js')
const searchengines = require('./searchengines.json')
const files = require('./files')
const icon = 'data:image/png;base64,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'

const quickSearch = (search) => {
  console.log(search)
  let quickSearchview = document.getElementById('view-quickSearch')
  const se = searchengines[files.settings.getValue('settings.searchEngine') || "Google"];
  if (quickSearchview) {
    if (search.startsWith('http')) {
      quickSearchview.loadURL(search)
    } else {
      quickSearchview.loadURL(se + search)
    }
  } else {
    if (search.startsWith('http')) {
      view.create('quickSearch', search)
      bookmarks.addBookmarksInUI('quickSearch', icon, search)
    } else {
      view.create('quickSearch', se + search)
      bookmarks.addBookmarksInUI('quickSearch', icon, se + search)
    }
  }
}

EventsEmitter.on('OPEN_QUICK_SEARCH', (data) => {
  quickSearch(data)
})

module.exports = quickSearch
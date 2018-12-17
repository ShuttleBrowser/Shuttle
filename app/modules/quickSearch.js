const view = require('./views.js')
const bookmarks = require('./bookmarks.js')
const searchEngines = require('./searchengines.json')
const files = require('./files')

const quickSearch = (search) => {
  let randomId = `quickSearch-${Math.floor(Math.random() * (1000 - 1) + 1)}`
  const se = searchEngines[files.settings.getValue('settings.searchEngine') || "Google"]

  if (search.startsWith('http')) {
    search = search
  } else {
    search = se + search
  }

  view.create(randomId, search)
  bookmarks.addBookmarksInUI(randomId, bookmarks.getIcon(search), search)
}

EventsEmitter.on('OPEN_QUICK_SEARCH', (data) => {
  quickSearch(data)
})

module.exports = quickSearch
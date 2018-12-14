const view = require('./views.js')
const bookmarks = require('./bookmarks.js')
const searchengines = require('./searchengines.json')
const files = require('./files')

const quickSearch = (search) => {
  let randomId = Math.floor(Math.random() * (1000 - 1) + 1)
  const se = searchengines[files.settings.getValue('settings.searchEngine') || "Google"]

  if (search.startsWith('http')) {
    bookmarks.getIcon(search).then((icon) => {
      view.create('quickSearch', search)
      bookmarks.addBookmarksInUI(`quickSearch-${randomId}`, icon, search)
    })
  } else {
    bookmarks.getIcon(se + search).then((icon) => {
      view.create('quickSearch', se + search)
      bookmarks.addBookmarksInUI(`quickSearch-${randomId}`, icon, se + search)
    })
  }
  
}

EventsEmitter.on('OPEN_QUICK_SEARCH', (data) => {
  quickSearch(data)
})

module.exports = quickSearch
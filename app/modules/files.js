let appPath

if (process.type === 'renderer') {
  appPath = require('electron').remote.app
} else {
  appPath = require('electron').app
}

const userData = appPath.getPath('userData')

const settingsFilePath = `${userData}/settings.json`
const bookamrksFilePath = `${userData}/bookmarks.json`
const modulesFilePath = `${userData}/modules.json`

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const settingsAdapter = new FileSync(settingsFilePath)
const bookmarksAdapter = new FileSync(bookamrksFilePath)
const modulesAdapter = new FileSync(modulesFilePath)

const settingsDb = low(settingsAdapter)
const bookmarksDb = low(bookmarksAdapter)
const modulesDb = low(modulesAdapter)

bookmarksDb.defaults({ bookmarks: [] }).write()
modulesDb.defaults({ modules: [] }).write()

const files = {
  settings: {
    getValue (key) {
      return settingsDb.get(key).value()
    },
  
    setValue (key, value) {
      settingsDb.set(key, value).write()
    }
  },
  
  bookmarks: {
    list () {
      return bookmarksDb.get('bookmarks').value()
    },
  
    get () {
      return bookmarksDb.get('bookmarks')
    },

    set (bookmarks) {
      bookmarksDb.get('bookmarks').set(bookmarks).write()
    },

    push (payload) {
      bookmarksDb.get('bookmarks').push(payload).write()
    },
  
    remove (payload) {
      bookmarksDb.get('bookmarks').remove(payload).write()
    },

    setIcon (id, url) {
      bookmarksDb.get('bookmarks')
      .find({ id: id })
      .assign({ icon: url })
      .write()
    },

    setOrder(id, order) {
      bookmarksDb.get('bookmarks')
      .find({ id: id })
      .assign({ order: order })
      .write()
    },

    sortByOrder() {
      bookmarksDb.sortBy('order').write()
    }
  },

  modules: {
    list () {
      return modulesDb.get('modules').value()
    },
  
    set (bookmarks) {
      modulesDb.get('modules').set(bookmarks).write()
    },

    push (payload) {
      modulesDb.get('modules').push(payload).write()
    },
  
    remove (payload) {
      modulesDb.get('modules').remove(payload).write()
    }
  }
}

module.exports = files
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
const applicationsFilePath = `${userData}/applications.json`

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const settingsAdapter = new FileSync(settingsFilePath)
const bookmarksAdapter = new FileSync(bookamrksFilePath)
const modulesAdapter = new FileSync(modulesFilePath)
const applicationsAdapter = new FileSync(applicationsFilePath)

const settingsDb = low(settingsAdapter)
const bookmarksDb = low(bookmarksAdapter)
const modulesDb = low(modulesAdapter)
const applicationDb = low(applicationsAdapter)

settingsDb.defaults({ settings: {}, history: [] }).write()
bookmarksDb.defaults({ bookmarks: [] }).write()
modulesDb.defaults({ modules: [] }).write()
applicationDb.defaults({ apps: [] }).write()

const files = {
  history: {
    get () {
      return settingsDb.get('history')
    },

    getHistory () {
      return settingsDb.get('history').value()
    },

    pushToHistory (payload) {
      settingsDb.get('history').push(payload).write()
    },

    resetHistory () {
      settingsDb.set('history', []).write()
    },

    remove (payload) {
      settingsDb.get('history').remove(payload).write()
    },
  },

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

    set (value) {
      bookmarksDb.set('bookmarks', value).write()
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
  
    get () {
      return modulesDb.get('modules')
    },

    push (payload) {
      modulesDb.get('modules').push(payload).write()
    },
  
    remove (payload) {
      modulesDb.get('modules').remove(payload).write()
    }
  },

  apps: {
    list () {
      return applicationDb.get('apps').value()
    },
  
    get () {
      return applicationDb.get('apps')
    },

    push (payload) {
      applicationDb.get('apps').push(payload).write()
    },
  
    remove (payload) {
      applicationDb.get('apps').remove(payload).write()
    }
  }
}

module.exports = files
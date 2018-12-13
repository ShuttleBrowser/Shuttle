let appPath

if (process.type === 'renderer') {
  appPath = require('electron').remote.app
} else {
  appPath = require('electron').app
}

const userData = appPath.getPath('userData')

const settingsFilePath = `${userData}/settings.json`
const bookamrksFilePath = `${userData}/bookmarks.json`
const applicationsFilePath = `${userData}/applications.json`
const modulesFilePath = `${userData}/modules.json`

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const settingsAdapter = new FileSync(settingsFilePath)
const bookmarksAdapter = new FileSync(bookamrksFilePath)
const applicationsAdapter = new FileSync(applicationsFilePath)
const modulesAdapter = new FileSync(modulesFilePath)

const settingsDb = low(settingsAdapter)
const bookmarksDb = low(bookmarksAdapter)
const applicationsDb = low(applicationsAdapter)
const modulesDb = low(modulesAdapter)

bookmarksDb.defaults({ bookmarks: [] }).write()
applicationsDb.defaults({ apps: [] }).write()
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
    }
  },
  
  apps: {
    list () {
      return applicationsDb.get('bookmarks').value()
    },
  
    push (payload) {
      applicationsDb.get('bookmarks').push(payload).write()
    },
  
    remove (payload) {
      applicationsDb.get('bookmarks').remove(payload).write()
    }
  },
  
  modules: {
    list () {
      return modulesDb.get('bookmarks').value()
    },
  
    push (payload) {
      modulesDb.get('bookmarks').push(payload).write()
    },
  
    remove (payload) {
      modulesDb.get('bookmarks').remove(payload).write()
    }
  }
}

module.exports = files
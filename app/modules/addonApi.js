const { ipcRenderer } = require('electron')
const { files, bookmarks, loadFile } = require('./index.js')

window.settings = {
	set (key, value) {
		files.settings.setValue(`settings.addon.${key}`, value)
	},

	get (key) {
		files.settings.getValue(`settings.addon.${key}`)
	}
}

window.bookmarks = bookmarks
window.inject = (file, id) => {
	if (file && id) {
		loadFile(file, id)
	}
}

window.alert = (message) => {
  ipcRenderer.send('PAGE_ALERT', {message: message})
}
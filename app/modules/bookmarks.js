const files = require('./files')
const views = require('./views.js')
const sync = require('./sync.js')

const bkms = {
  createBookmark (url) {
    let bkmsList = files.bookmarks.list()
    let bkmId

    if (bkmsList.length === 0) {
      bkmId = 1
    } else {
      bkmId = bkmsList[bkmsList.length - 1].id + 1
    }

    url = this.repairUrl(url)

    files.bookmarks.push({
      id: bkmId,
      url: url,
      icon: null
    })

    console.log(`Add : ${url}`)

    bkms.getIcon(url).then((icon) => {
      files.bookmarks.setIcon(bkmId, icon)
      bkms.addBookmarksInUI(bkmId, icon, url)
      views.create(bkmId, url)
      sync.uploadBookmarks()
    })
  },

  repairUrl (url) {
    if (!url.startsWith('https') || !url.startsWith('http')) {
      return `http://${url}`
    } else {
      return url
    }
  },

  removeBookmark (id) {
    if (id !== 'quickSearch') {
      this.removeBookmarkInFile(id)
    }
    this.removeBookmarkInUI(id)
  },

  removeBookmarkInUI (id) {
    let bookmarkToRemove = document.getElementById(`id-${id}`)
    views.remove(id)
    if (bookmarkToRemove) {
      bookmarkToRemove.remove()
    }
  },

  removeBookmarkInFile (id) {
    this.removeBookmarkInUI
    files.bookmarks.remove({
      id: id
    })
    sync.uploadBookmarks()
  },

  addBookmarksInUI (id, icon, url, type) {
    let navZone = document.querySelector('.bkms')
    if (type === 'addon') {
      navZone.innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="view.show('${id}', '${url}', 'addon')" oncontextmenu="modales.uninstallAddon('${id}')" onmouseover="controlBar.show('${id}', true)" style="background-image: url('${icon}');"></a>`
    } else if (id !== 'quickSearch') {
      navZone.innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="view.show(${id}, '${url}')" oncontextmenu="modales.removeBookmark(${id}, '${url}')" onmouseover="controlBar.show(${id}, true)" style="background-image: url(${icon});"></a>`
    } else {
      navZone.innerHTML += `<a href="#" class="bubble-btn" id="id-${id}" onclick="view.show('${id}', '${url}')" oncontextmenu="modales.removeBookmark('${id}', '${url}')" onmouseover="controlBar.show('${id}', true)" style="background-image: url(${icon});"></a>`
    }
  },

  getIcon (url) {
    if (url.includes('http://')) {
      url = url.replace('http://', '')
    } else if (url.includes('https://')) {
      url = url.replace('https://', '')
    } else {
      url = url
    }

    return new Promise((resolve) => {
      resolve(`https://api.faviconkit.com/${url}/144`)
    })
  },

  loadBookmarks () {
    return new Promise((resolve) => {
      document.querySelector('.bkms').innerHTML = ""

      sync.syncBookmarks().then((bkm) => {
        console.log(bkm)
        for (i in bkm) {
          bkms.addBookmarksInUI(bkm[i].id, bkm[i].icon, bkm[i].url)
        }
      }).catch(() => {
        let bkm = files.bookmarks.list()

        for (i in bkm) {
          bkms.addBookmarksInUI(bkm[i].id, bkm[i].icon, bkm[i].url)
        }
      })

      resolve()
    })
  }
}

setInterval(() => {
  bkms.loadBookmarks()
}, 60000)

module.exports = bkms
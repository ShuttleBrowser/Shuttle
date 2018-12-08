const socket = require(`./sockets.js`)
const fs = require('fs')
const lowdb = require('lowdb')

// Lowdb db init
const FileSync = require('lowdb/adapters/FileSync')
const settingsAdapter = new FileSync(`${app.getPath('userData')}/settings.json`)
const settings = lowdb(settingsAdapter)

const bookmarksFile = `${app.getPath('userData')}/db.json`

const sync = {

    upload: () => {

        if (settings.get('user.isLogin').value) {

            if (socket.connected) {

                fs.readFile(bookmarksFile, (err, data) => {
                    console.log(data.toString())
                })

            }

        }

    }

}

module.exports = sync
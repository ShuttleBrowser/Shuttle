const socket = require(`${__dirname}/../app/modules/sockets.js`)
const lowdb = require('lowdb')

// Lowdb db init
const FileSync = require('lowdb/adapters/FileSync')
const LowdbAdapter = new FileSync(`${app.getPath('userData')}/settings.json`)
const db = lowdb(LowdbAdapter)

const sync = {

    upload: (data) => {

        if (socket.)

    }

}
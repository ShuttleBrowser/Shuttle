const socket = require('socket.io-client')('http://localhost:1001');

socket.on('connect', () => {
    console.log('Connected')
})

socket.on('disconnect', () => {
    console.log('disconnected')
})

socket.on('message', (data) => {
    console.log(data)
})

setInterval(() => {
    if (!socket.connected) {
        console.log('[SOCKET] not connected')
    }
}, 10000)

module.exports = socket
const express = require('express');
const app = express();
const server = require('http');
const path = require('path');
const prefix = {
	warn: "[WARN]",
	info: "[INFO]",
	error: "[ERROR]"
};

// Dossier static
app.use('/assets', express.static('assets'));
 
// Routes
app.get('/', function(req, res) {
   res.sendFile(path.join(__dirname + '/view/index.html'));
   console.log(`${prefix.info} (${req.connection.remoteAddress}) >> index.html`);
});

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname + '/view/404.html'));
   console.log(`${prefix.warn} (${req.connection.remoteAddress}) >> 404.html`);
});

server.createServer(app).listen(80);
'use strict';
const electron = require('electron');
const menubar = require('menubar');
const url = require('url');
const path = require('path');
const request = require('request');
const storage = require('electron-settings');
const http = require('http');
const fs = require('fs');
const unzip = require('unzip');

var mb = menubar({
  index: "file://" + __dirname + "/index.html",
  tooltip: "Shuttle",
  icon:__dirname + "/res/logo.png",
  width:360,
  height:640,
  resizable: false
});
//on créé le menu "click droit"
const contextMenu = electron.Menu.buildFromTemplate([
  {
    label: 'About',
    click() {
    //on ouvre le site sur la page "about"
      electron.shell.openExternal('https://electron.atom.io')
    }
  },
  {
    label: 'Updates',
    click() {
      update(true);
    }
  },
  {type: 'separator'},
  {
    label: 'Quit',
    click() {
    //on quitte l'app
      mb.app.quit();
      console.log('stopping');
    }
  }

]);

mb.on('ready', function () {
  update()
  console.log('Shuttle is ready');
  if (process.platform == 'win32') {
    mb.tray.setContextMenu(contextMenu);
  }
});

function update(check) {
	if (storage.has('version')) {
		request('http://polygates.livehost.fr/UPDATES/Shuttle.txt', function (error, response, body) {
		  console.log('version:', body);
		  if (body != storage.get('version')) {
		    storage.set('version', body);
		    console.log("Download Update...");
		    downloadFile("http://polygates.livehost.fr/UPDATES/ShuttleUpdate.zip", __dirname+"/ShuttleUpdate.zip");
		  } else if (check) {
		    electron.dialog.showMessageBox({title: "Shuttle", type:"info", message: "No update avalible"});
		  }
		});
	} else {
		request('http://polygates.livehost.fr/UPDATES/Shuttle.txt', function (error, response, body) {
			storage.set('version', body);
		});
	}
}


function downloadFile(file_url , targetPath){
    // Save variable to know progress
    var received_bytes = 0;
    var total_bytes = 0;

    var req = request({
        method: 'GET',
        uri: file_url
    });

    var out = fs.createWriteStream(targetPath);
    req.pipe(out);

    req.on('response', function ( data ) {
        // Change the total bytes value to get progress later.
        total_bytes = parseInt(data.headers['content-length' ]);
    });

    req.on('data', function(chunk) {
        // Update the received bytes
        received_bytes += chunk.length;

        showProgress(received_bytes, total_bytes);
    });

    req.on('end', function() {
        console.log("File succesfully downloaded");
        console.log("Extracting...");
        fs.createReadStream(__dirname+"/ShuttleUpdate.zip").pipe(unzip.Extract({ path: __dirname+'/' }));
    	electron.dialog.showMessageBox({title: "Shuttle", type:"info", message: "Update complete !"});
        fs.unlink(__dirname+"/ShuttleUpdate.zip")
    });
}

function showProgress(received,total){
    var percentage = (received * 100) / total;
    console.log(percentage + "% | " + received + " bytes out of " + total + " bytes.");
}
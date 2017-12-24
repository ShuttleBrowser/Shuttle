const DecompressZip = require('decompress-zip');
const http = require('http');
const request = require('request');
const appVersion = require('../package.json').version;
const fs = require('fs');
const osLocale = require('os-locale');
const electron = require("electron");

var updateZip = new DecompressZip(__dirname+"/update.zip");

function downloadFile(configuration){
    return new Promise(function(resolve, reject){
        // Save variable to know progress
        var received_bytes = 0;
        var total_bytes = 0;

        var req = request({
            method: 'GET',
            uri: configuration.remoteFile
        });

        var out = fs.createWriteStream(configuration.localFile);
        req.pipe(out);

        req.on('response', function ( data ) {
            // Change the total bytes value to get progress later.
            total_bytes = parseInt(data.headers['content-length' ]);
        });

        // Get progress if callback exists
        if(configuration.hasOwnProperty("onProgress")){
            req.on('data', function(chunk) {
                // Update the received bytes
                received_bytes += chunk.length;

                configuration.onProgress(received_bytes, total_bytes);
            });
        }else{
            req.on('data', function(chunk) {
                // Update the received bytes
                received_bytes += chunk.length;
            });
        }

        req.on('end', function() {
            resolve();
        });
    });
}

exports.updateAndInstall = function () {
//we get the json file
	request('http://update.getshuttle.xyz/updates.txt', function (error, response, body) {
		if (error) {
			console.log("Error for checking update");
		} else if (response) {
			if (body != appVersion) {
				console.log("Download...");
				downloadFile({
				    remoteFile: "http://update.getshuttle.xyz/Latest.zip",
				    localFile: __dirname+"/update.zip",
				    onProgress: function (received,total){
				        var percentage = (received * 100) / total;
				        console.log(percentage + "% | " + received + " bytes out of " + total + " bytes.");
				    }
				}).then(function(){
					console.log("Download finished");
					console.log("Extacting...");
					updateZip.extract({
						path: __dirname+'/../',
						filter: function (file) {
							return file.type !== "SymbolicLink";
						}
					});
					console.log("Extacted");
					if (osLocale.sync().indexOf("fr_FR") > -1 || osLocale.sync().indexOf("fr_BE") >-1 || osLocale.sync().indexOf("fr_CA") >-1) {
						electron.dialog.showMessageBox({title: "Shuttle", type:"info", message: "Une mise à jour a été téléchargée, veuillez redémarrer l'application pour avoir accès aux nouvelles fonctionnalités.", buttons: ["Close"] });
					} else if (osLocale.sync() == "en_US" || osLocale.sync() == "en_EN") {
						electron.dialog.showMessageBox({title: "Shuttle", type:"info", message: "Please restart shuttle to apply the update.", buttons: ["Close"] });
					} else {
						electron.dialog.showMessageBox({title: "Shuttle", type:"info", message: "Please restart shuttle to apply the update.", buttons: ["Close"] });
					}
				});	
			}
		}
	});

}
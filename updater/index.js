const DecompressZip = require('decompress-zip');
const http = require('http');
const request = require('request');
const appVersion = require('../package.json').version;
const fs = require('fs');
const osLocale = require('os-locale');
const electron = require("electron");

var updateZip = new DecompressZip("update.zip");
exports.updateAndInstall = function () {
//we get the json file
	request('http://update.getshuttle.xyz/updates.txt', function (error, response, body) {
		if (error) {
			console.log("Error for checking update");
		} else if (response) {
			if (body != appVersion) {
				console.log("Download...");
				var UpdateFile = fs.createWriteStream("update.zip");
				var request = http.get("http://update.getshuttle.xyz/Latest.zip", function(response) {
					response.pipe(UpdateFile);
					console.log("Download finished");
					console.log("Extacting...");
					updateZip.extract({
					    path: '.',
					    filter: function (file) {
					        return file.type !== "SymbolicLink";
					    }
					});
					console.log("Extacted");
					if (osLocale.sync() == "fr_FR") {
						electron.dialog.showMessageBox({title: "Shuttle", type:"info", message: "Une mise à jour a été télécharger, veuillez redémarrer l'application pour avoir accès aux nouvelles fonctionnalités.", buttons: ["Close"] });
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
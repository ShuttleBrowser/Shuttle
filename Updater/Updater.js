const http = require('http');
const unzip = require('unzip');
const fs = require('fs');
const request = require('request');

//updateAndInstall();
//function updateAndInstall() {

exports.updateAndInstall = function () {

	request('http://update.getshuttle.xyz/updates.json', function (error, response, body) {

	  if (body != fs.readFileSync(__dirname+"/version.txt", "utf8")) {
	    console.log("\n######################################\n");
	    console.log("Update availible !\n");

		var UpdateFile = fs.createWriteStream(__dirname+"/Update.zip");
		var request = http.get("http://update.getshuttle.xyz/Latest.zip", function(response) {
			response.pipe(UpdateFile);
			console.log("Download complete");
			console.log("Extract...\n");
			fs.createReadStream(__dirname +"/Update.zip").pipe(unzip.Extract({ path: "./" }));
			console.log("Extract complete !\n");
			writefile(body);
			console.log("Update complete !\n");
			console.log("######################################\n");
		});
	  } else {
	  	console.log("no-update");
	  }
	});

	function writefile(version) {
		fs.writeFile(__dirname+"/version.txt", version, function(err) {
		    if(err) {
		        return console.log(err);
		    }
		});
	}

	function sleep(milliseconds) {
	  var start = new Date().getTime();
	  for (var i = 0; i < 1e7; i++) {
	    if ((new Date().getTime() - start) > milliseconds){
	      break;
	    }
	  }
	}

}

const osLocale = require('os-locale');

if (osLocale.sync().indexOf("fr_FR") > -1 || osLocale.sync().indexOf("fr_BE") >-1 || osLocale.sync().indexOf("fr_CA") >-1) {
	var lang = require(__dirname + "/../assets/lang/fr.js");
} else if (osLocale.sync().indexOf("en_US") > -1 || osLocale.sync().indexOf("en_EN") > -1) {
	var lang = require(__dirname + "/../assets/lang/en.js");
} else {
	var lang = require(__dirname + "/../assets/lang/en.js");
}

	const settings = require("electron-settings");
	const AutoLaunch = require('auto-launch');
	const remote = require('electron').remote;
	const fs = require('fs');
	const {ipcRenderer} = require('electron');

	const appVersion = require('../package.json').version;

	const versionNumber = document.querySelector('.version');
	const sopen = document.getElementById('SOpen');
	const saboot = document.getElementById('SAboot');
	const exportF = document.getElementById('Export');
	const importF = document.getElementById('Import');
	const reset = document.getElementById('Reset');
	const frame = document.getElementById('Frame');
	const bookmarks = document.getElementById('bkms');

	const checkboxSOpen = document.querySelector("input[name=SOpen]");
	const checkboxAutoStart = document.querySelector("input[name=AutoStart]");
	const downloadBtn = document.querySelector("input[name=download]");
	const uploadBtn = document.querySelector("input[name=upload]");
	const ResetBtn = document.querySelector("input[name=reset]");
	const frameBtn = document.querySelector("input[name=Frame]");
	const devmodBtn = document.querySelector("input[name=DevMod]");
	const showConsoleBtn = document.querySelector("input[name=ShowConsole]");
	const reportBtn = document.querySelector("input[name=report]");

	var ShuttleAutoLauncher = new AutoLaunch({
	    name: 'Shuttle',
	});

	checkboxAutoStart.addEventListener( 'change', function() {
	    if(this.checked) {
			ShuttleAutoLauncher.enable();
			settings.set('ShuttleAutoLauncher', true);
	    } else {
			ShuttleAutoLauncher.disable();
			settings.set('ShuttleAutoLauncher', false);
	    }
	});

	checkboxSOpen.addEventListener( 'change', function() {
	    if(this.checked) {
			settings.set('SOpen', true);
			ipcRenderer.send('SettingSetAlwaysOnTop', true);
	    } else {
			settings.set('SOpen', false);
			ipcRenderer.send('SettingSetAlwaysOnTop', false);
	    }
	});

	frameBtn.addEventListener( 'change', function() {
	    if(this.checked) {
			settings.set('Frame', true);
			ipcRenderer.send('SettingSetFrame', true);
	    } else {
			settings.set('Frame', false);
			ipcRenderer.send('SettingSetFrame', false);
	    }
	});

	devmodBtn.addEventListener( 'change', function() {
	    if(this.checked) {
	    	alert("Caution: you're going to developer mode. You may encounter unknown issues that could corrupt Shuttle's installation and force you to install it again.", "Developer Mode")
			settings.set('DevMod', true);
			reportBtn.disabled = false;
			showConsoleBtn.disabled = false;
	    } else {
			settings.set('DevMod', false);
			reportBtn.disabled = true;
			showConsoleBtn.disabled = true;
	    }

	});

	downloadBtn.addEventListener( 'click', function() {
		downloadFavorites();
	});
	uploadBtn.addEventListener( 'click', function() {
		uploadFavorites();
	});
	ResetBtn.addEventListener( 'click', function() {
		resetFavorites();
	});
	showConsoleBtn.addEventListener( 'click', function() {
		ipcRenderer.send('OpenDevTool');
	});
	reportBtn.addEventListener( 'click', function() {
		ipcRenderer.send('OpenReportWindow');
	});


	versionNumber.innerHTML += "SHUTTLE VERSION "+appVersion;
	sopen.innerHTML += lang.SOpen;
	saboot.innerHTML += lang.SAboot;
	exportF.innerHTML += lang.Export;
	importF.innerHTML += lang.Import;
	reset.innerHTML += lang.ResetBtn;
	frame.innerHTML += lang.Frame;
	bookmarks.innerHTML += lang.Bookmarks;

	devtitle.innerHTML += lang.Developper;
	dmod.innerHTML += lang.dmod;
	shcons.innerHTML += lang.shcons;
	rep.innerHTML += lang.rep;

if (settings.get('ShuttleAutoLauncher') == true) {checkboxAutoStart.checked = true;} else {checkboxAutoStart.checked = false;}
if (settings.get('SOpen') == true) {checkboxSOpen.checked = true;} else {checkboxSOpen.checked = false;}
if (settings.get('Frame') == true) {frameBtn.checked = true;} else {frameBtn.checked = false;}

if (settings.get('DevMod') == true) {
	devmodBtn.checked = true;
	showConsoleBtn.disabled = false
	reportBtn.disabled = false
} else {
	devmodBtn.checked = false;
	showConsoleBtn.disabled = true;
	reportBtn.disabled = true;
}

document.querySelector(".close").addEventListener("click", function (e) {
    var window = remote.getCurrentWindow();
    window.close();
}); 


function downloadFavorites() {
	var data = fs.readFileSync(__dirname+'/../data.json','utf8');
	var fileToSave = new Blob([data], {
	    type: 'application/json',
	    name: "data.shtd"
	});
	saveAs(fileToSave, "data.shtd");
}

function uploadFavorites() {
   remote.dialog.showOpenDialog({filters: [{name: 'Shuttle data', extensions: ['shtd']}]}, function (fileNames) { 
      if(fileNames === undefined) { 
         console.log("No file selected"); 
      } else { 
        console.log(fileNames[0]);
        fs.createReadStream(fileNames[0]).pipe(fs.createWriteStream(__dirname+'/../data.json'));
		alert(lang.restartApp);
      } 
   });

}

function resetFavorites() {
	var choice = remote.dialog.showMessageBox({
		type: 'question',
		buttons: [lang.Yes, lang.No],
		title: 'Confirm',
		message: lang.Reset
	});
	if (choice == 0) {
		console.log('Reset...');
		fs.writeFile(__dirname+'/../data.json', '[{"web":"changelog.getshuttle.xyz"}', function (err) {
		    if (err) 
		        return console.log(err);
		});
	}
}
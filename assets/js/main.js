//					   Dev by Robin Jullian, Shuttle Ltd
//
//   		              GNU GENERAL PUBLIC LICENSE
//  	                     Version 3, 29 June 2007
//		
// 		Copyright (C) 2007 Free Software Foundation, Inc. <http://fsf.org/>
// 		Everyone is permitted to copy and distribute verbatim copies
// 		of this license document, but changing it is not allowed.

const data = [
	{"web": "http://google.com"},
	{"web": "http://getshuttle.xyz"}
];

//set the prefix for debug
const prefix = {
	warn: "[WARN]",
	info: "[INFO]",
	error: "[ERROR]"
};

//shuttle function
const shuttle = {

	//function to load website
	loadWebSite: (url) => {
		//define the webview
		let webview = document.querySelector("webview");
		//check internet connection
		if (navigator.onLine == true) {
    		webview.setAttribute("src", url);
   			console.log(`${prefix.info} "${url}" successfully loaded`);
		} else if (navigator.onLine == false) {
			console.log(`${prefix.error} no connection`);
    		webview.setAttribute("src", "http://localhost/dsdsd");
		}

	},

	//function to load bar
	loadBar: () => {
		//define the bar
		let bar = document.querySelector(".bar");
		//reset the bar
		bar.innerHTML = "";

		//we create the bookmarks buttons
	    $(`<a href="#" url="changelog" class="btn" id="0" title="changelog" onclick="shuttle.loadWebSite('http://changelog.getshuttle.xyz')" style="background-image: url(assets/img/shuttle-cr.svg);"></a>`).appendTo(bar);
		for (i in data) {
			console.log(`${prefix.info} creating btn for ${data[i].web}`);
	       	$(`<a href="#" url="${data[i].web}" class="btn" id="${i+1}" title="${data[i].web}" onclick="shuttle.loadWebSite('${data[i].web}')"></a>`).appendTo(bar);
	       	shuttle.getIcon(data[i].web, i);
		}
		//we create the "add" button
		$("<a href=\"javascript:shuttle.addWebsite()\" class=\"add-btn\"></a>").appendTo(bar);
	},

	//function to add a new website from the bookmarks
	addWebsite: () => {
		vex.dialog.open({
		    message: 'Add a favorite',
		    input: [
		        '<input name="url" type="text" placeholder="http://" required />'
		    ].join(''),
		    buttons: [
		        $.extend({}, vex.dialog.buttons.YES, { text: 'add' }),
		        $.extend({}, vex.dialog.buttons.NO, { text: 'cancel' })
		    ],
		    callback: function (dat) {
		        if (!dat) {
		            console.log('Cancelled')
		        } else {

					if (!/^https?:\/\//i.test(dat.URL)) { // add http protocol to the url to make url-exists
						data.push({"web": "http://"+dat.url+""});
					} else {
						data.push({"web": ""+dat.url+""});		
					}

					shuttle.loadBar();
					shuttle.initRightClick();
		        }
		    }
		})
	},

	//function to remove a website from the bookmarks
	removeWebsite: (url, id) => {
		if (url != "changelog") {
			vex.dialog.confirm({
			    message: 'Remove the btn ?',
			    callback: function (value) {
			        if (value) {
						console.log(`${prefix.info} Remove > ${url}`);
						$( `#${id}` ).remove();
			        }
			    }
			});
		}
	},

	//function to init the right click
	initRightClick: () => {
		$( ".btn" ).contextmenu(function() {
		  shuttle.removeWebsite($(this).attr("url"), $(this).attr("id"))
		});
	},

	getIcon: (uri, id) => {
		$('#'+id+1).css('background-image', 'url(https://www.google.com/s2/favicons?domain='+uri+')');
	},

	//function to use GET value
	getQueryVariable : (variable) => {
	       var query = window.location.search.substring(1);
	       var vars = query.split("&");
	       for (var i=0;i<vars.length;i++) {
	               var pair = vars[i].split("=");
	               if(pair[0] == variable){return pair[1];}
	       }
	       return(false);
	}

};

//initialize app
$( document ).ready(function() {
	shuttle.loadBar();
	shuttle.initRightClick();
	console.log(shuttle.getQueryVariable("password"));
	console.log(shuttle.getQueryVariable("userid"));
});
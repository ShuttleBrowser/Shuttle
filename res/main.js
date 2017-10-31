const webview = document.querySelector('webview');
const bar = document.querySelector('.bar');
const path = __dirname+'/res/data.json';
const {shell} = require('electron');

(function() {
  function callback(e) {
    var e = window.e || e;
    if (e.target.localName == 'a') {
      e.preventDefault();
    }
    return
  }

  if (document.addEventListener) {
    document.addEventListener('auxclick', callback, false);
  } else {
    document.attachEvent('onauxclick', callback);
  }
})()

function showWebsite(url) {
	if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0) {
		document.querySelector('webview').setAttribute('src', url);
	} else if (url.indexOf("http://") == -1) {
		document.querySelector('webview').setAttribute('src', "http://"+url);
	} else {
		console.log("Error at loading");
	}
}


(function() {
function scrollHorizontally(e) {
    e = window.event || e;
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    document.documentElement.scrollLeft -= (delta*40); // Multiplied by 40
    document.body.scrollLeft -= (delta*40); // Multiplied by 40
    e.preventDefault();
}
	bar.addEventListener("mousewheel", scrollHorizontally, false);
})();

function addWebsite() {
	vex.dialog.open({
	    message: 'Enter the url of a website:',
	    input: [
	        '<input name="URL" type="text" placeholder="http://" required />',
	    ].join(''),
	    buttons: [
	        $.extend({}, vex.dialog.buttons.YES, { text: 'Add' }),
	        $.extend({}, vex.dialog.buttons.NO, { text: 'Cancel' })
	    ],
	    callback: function (data) {
	        if (data) {
	            console.log('URL', data.URL)
				var save = fs.createWriteStream(path, {
				  flags: 'a'
				})
				save.write(',{"web":"'+data.URL+'"}');
	            save.end()
				 loadJSON(function(response) {
				    var link = JSON.parse(response+"]");
				    console.log(link);
				    location.reload();
				 });
	        }
	    }
	});
}

	//on définie les régles css pour la webview
	webview.addEventListener('dom-ready', function () {
	    webview.insertCSS('\n \
	::-webkit-scrollbar {\n \
		width: 5px;\n \
		height: 5px;\n \
	}\n \
	::-webkit-scrollbar-track {\n \
		-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);\n \
		-webkit-border-radius: 10px;border-radius: 10px;\n \
	}\n \
	::-webkit-scrollbar-thumb {\n \
		background: transparent;\n \
		-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);\n \
	}\n \
	::-webkit-scrollbar-thumb:window-inactive {\n \
		background: grey;\n \
	}')
	});


 loadJSON(function(response) {
    var link = JSON.parse(response+"]");
    console.log(link);
    updateBar(link);
 });

 function loadJSON(callback) {   
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', path, true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }

function getColor(link, key) {
	getColors('https://www.google.com/s2/favicons?domain='+link).then(colors => {
		console.log('https://www.google.com/s2/favicons?domain='+link);
		document.getElementById("bar"+key).style.backgroundColor = colors[4].hex();
	})
}

//on affiche les boutons
function updateBar(link) {
	bar.innerHTML = "";
	for (var key in link) {
		bar.innerHTML += "<a href=\"#\" class=\"btn\" id=\"bar"+key+"\" onclick='showWebsite(\""+link[key].web+"\")'></a>";
		getColor(link[key].web, key);
	}
	bar.innerHTML += "<a href=\"javascript:addWebsite()\" class=\"add-btn\"></a>";
}
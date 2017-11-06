//get the webview
const webview = document.querySelector('webview');

//get the navbar
const bar = document.querySelector('.bar');

//get the path of json file
const path = __dirname+'/assets/data.json';

//import electron
const {shell} = require('electron');

//set $ to jQuery function
const $ = jQuery;

 $.get("https://ipinfo.io", function(response) {
      if (response.country == "FR") {
        const lang = require(__dirname + "/assets/lang/fr.js");
        console.log(lang.noUpdate);
      } else {
        const lang = require(__dirname + "/assets/lang/en.js");
        console.log(lang.noUpdate);
      }
  }, "jsonp");

//Remove the mouswheel click
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
})();

  bar.addEventListener("mousewheel", scrollHorizontally, false);

//function to open the url of the webview
function showWebsite(url) {
  //if there is http:// or https:// in valu we load the web page
  if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0) {
    webview.setAttribute('src', url);
  } else if (url.indexOf("http://") == -1) {
    webview.setAttribute('src', "http://"+url);
  } else {
    console.log("Error at loading");
  }
}

//Add horizontall scroll for navbar
function scrollHorizontally(e) {
    e = window.event || e;
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    document.documentElement.scrollLeft -= (delta*40); // Multiplied by 40
    document.body.scrollLeft -= (delta*40); // Multiplied by 40
    e.preventDefault();
}

//Function for add website
function addWebsite() {
  vex.dialog.open({
      //we ask the url to the user
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
            console.log('URL', data.URL);
            //we open the data.json file
            var save = fs.createWriteStream(path, {
                flags: 'a'
            });

            //we write the json file with the url given by the user
            save.write(',{"web":"'+data.URL+'"}');
            save.end()
            
                //we set a random id for the new bookmark
                var RandomID = Math.floor((Math.random() * 10000) + 1000);

                //we remove the add button so that the new button does not cover it
                document.querySelector('.add-btn').remove();
                //we add the new button
                $("<a href=\"#\" id=\""+RandomID+"\" class=\"btn\" url=\""+data.URL+"\" onclick='showWebsite(\""+data.URL+"\")'></a>").appendTo(bar);
                //we set the background-color
                getColor(data.URL, RandomID);
                //we add the add button
                $("<a href=\"javascript:addWebsite()\" class=\"add-btn\"></a>").appendTo(bar);
                //we initialize the right-click function
                rightClick();
          }
      }
  });
}

  //we define the rules css for the webview
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

//we load the json file
 loadJSON(function(response) {
    var link = JSON.parse(response+"]");
    console.log(link);
    updateBar(link);
 }, path);

//function to load a json file
 function loadJSON(callback, jsonfile) {   
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', jsonfile, true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }

//function to set the color of the background with the main color of the favicon
function getColor(link, key) {
  getColors('https://www.google.com/s2/favicons?domain='+link).then(colors => {
    console.log('https://www.google.com/s2/favicons?domain='+link);
    document.getElementById(key).style.backgroundColor = colors[4].hex();
  })
}

//we show the buttons
function updateBar(link) {
  bar.innerHTML = "";
  for (var key in link) {
   $("<a href=\"#\" url=\""+link[key].web+"\" title=\""+link[key].web+"\" class=\"btn\" id=\""+key+"\" onclick='showWebsite(\""+link[key].web+"\")'></a>").appendTo(bar);
    getColor(link[key].web, key);
	$('#'+key).tooltipster();
  }
  $("<a href=\"javascript:addWebsite()\" class=\"add-btn\"></a>").appendTo(bar);
  rightClick();
}

//function to remove an bookmark with a right click
function rightClick() {
    $('.btn').on("contextmenu", function (e) {
      if (this.id == "0") {
        console.warn("Nope");
      } else {
        var id = this.id;
        console.log(id);

        var UrlToRemove = $("#"+id).attr("url");
        console.log(UrlToRemove);
        removeWebsite(id, UrlToRemove);
      }
    });
}

//removing function of bookmark
function removeWebsite(ida, url) {
  vex.dialog.confirm({
      message: "Remove "+url+" from bookmarks?",
      buttons: [
        $.extend({}, vex.dialog.buttons.YES, {
          text: 'Continue'
        }),
        $.extend({}, vex.dialog.buttons.NO, {
          text: 'Cancel'
        })
      ],
      callback: function (value) {
        var id = ida;
          if (value) {
            var ButtonToRemove = document.getElementById(id);
            ButtonToRemove.remove();
            replace({
              regex: ',{"web":"'+url+'"}',
              replacement: "",
              paths: [''+path+''],
              recursive: true,
              silent: true,
            });

          }
      }
  }, vex.closeAll());
}

rightClick();
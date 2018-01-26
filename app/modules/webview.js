view.addEventListener('dom-ready', function () {
  webview.insertCSS(`\

    ::-webkit-scrollbar { 
      width: 5px; 
      height: 5px; 
      background-color: white; 
    } 

    ::-webkit-scrollbar-thumb { 
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3); 
      background-color: #555; 
    } 

  `)
})

/* global view */
const useragent = 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G920F Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.97 Mobile Safari/537.36 Shuttle/2.0'

module.exports = {
  adapteWebSite: (url) => {
    // adpate webview for messenger
    if (url.startsWith('messenger.com')) {
      // remove the UserAgent
      view.setUserAgent('')
      view.addEventListener('dom-ready', function () {
        // insert custom css for messenger
        view.insertCSS(`\
            ._z4_{overflow:hidden;}._4u-c{transition:height0.3sease;}._4sp8{min-width:350px!important;}._1z8r{padding:4px0!important;float:right!important;clear:right!important;}._1z8q{display:block!important;font-size:30px!important;float:left;padding:7px5px;}._4owc._53ij{width:40px!important;height:290px!important;}._2u_d{transform:translate(5%,-50%)!important;max-width:40px;}._nd_._2u_d{transform:translate(-105%,-50%)!important;max-width:40px;}._59s7{width:360px!important;}._3-8x{margin-top:0px!important;}._39bj{display:inline-block!important;}._2swd._kmc{margin-bottom:-9px;}._5irm{display:block;flex-direction:row;margin:08px012px;position:relative;}._kmc{overflow-x:hidden;overflow-y:auto;margin-right:-8px;padding:9px9px9px0!important;}._4_j5{max-width:250px;position:fixed;background-color:white;z-index:300;opacity:0.91;}._40fu{transform:rotate(270deg)translate(2%,-131%)!important;}._nd_._2u_d{transform:translate(-100%,-110%)!important;}._2u_d{flex-direction:row-reverse;transform:translate(-100%,0)!important;}._5zvq{transform:rotate(90deg);}._2rvp{transform:rotate(90deg);}._2u_d:nth-child(2){margin:00px!important;}._2t5t{transform:rotate(90deg);}._55q{max-width:82%;}
          `)
      })

      // adapte webview for spotify
    } else if (url.startsWith('spotify.com')) {
      view.setUserAgent('')
    } else {
      view.setUserAgent(useragent)
    }
  }
}
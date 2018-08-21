<template>
  <div class="browser">
    <bookmarksBar></bookmarksBar>
    <mainMenu></mainMenu>
    <div class="view">
      <webview class="inactive" :useragent="mobileUserAgent" src="http://changelog.getshuttle.xyz"></webview>
      <webview class="active" :useragent="mobileUserAgent" src="http://twitter.com"></webview>
      <webview class="inactive" :useragent="mobileUserAgent" src="http://google.com"></webview>
      <webview class="inactive" :useragent="mobileUserAgent" src="http://github.com"></webview>
    </div>
  </div>
</template>

<script>
  import bookmarksBar from './browser/bookmarksBar.vue'
  import mainMenu from './browser/mainMenu.vue'

  export default {
    name: 'browser',
    components: {
      bookmarksBar,
      mainMenu
    },
    data () {
      return {
        mobileUserAgent: 'Mozilla/5.0 (Linux; Android 8.0; Pixel XL Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36',
        desktopUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
      }
    },
    methods: {}
  }
</script>

<style>
.view webview {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 35px;
  right: 0px;
}

.inactive {
  opacity: 0;
  z-index: -1;
}

.active {
  opacity: 1;
  z-index: 1;
}
</style>

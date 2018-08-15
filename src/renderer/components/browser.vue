<template>
  <div class="browser">
    <bookmarks-bar></bookmarks-bar>
    <main-menu></main-menu>
    <webview class="view" src="http://changelog.getshuttle.xyz"></webview>
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
    methods: {}
  }
</script>

<style>
.view {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 35px;
  right: 0px;
}
</style>

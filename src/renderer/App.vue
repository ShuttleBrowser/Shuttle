<template>
  <div id="app">
    <title-bar></title-bar>
    <router-view></router-view>
  </div>
</template>

<script>
  import titleBar from './components/titleBar.vue'
  import browser from './components/browser.vue'

  export default {
    name: 'shuttle',
    components: {
      browser,
      titleBar
    }
  }
</script>

<style>
</style>

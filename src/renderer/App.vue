<template>
  <div id="app">
    <titleBar></titleBar>
    <router-view></router-view>
  </div>
</template>

<script>

import titleBar from './components/titleBar.vue'

export default {
  name: 'shuttle',
  components: {
    titleBar
  }
}

</script>

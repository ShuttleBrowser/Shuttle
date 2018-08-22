<template>
  <div id="app">
    <title-bar/>
    <router-view></router-view>
  </div>
</template>

<script>

import TitleBar from './components/TitleBar.vue'

export default {
  name: 'shuttle',
  components: {
    TitleBar
  }
}
</script>

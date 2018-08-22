<template>
  <div class="control-bar">
    <a href="#"><i class="fa fa-arrow-left" aria-hidden="true"></i></a>
    <a href="#"><i class="fa fa-arrow-right" aria-hidden="true"></i></a>
    <a href="#"><i class="fa fa-refresh" aria-hidden="true"></i></a>
    <a href="#"><i class="fa fa-scissors" aria-hidden="true"></i></a>
  </div>
</template>

<script>
export default {
  name: 'ControlBar',
  methods: {}
}
</script>

<style scoped>
  .control-bar {
    display: none;
    position: absolute;
    top: 50px;
    left: 35px;
    width: 30px;
    height: 128px;
    background-color: #F4F4F4;
    text-align: center;
    transition: 0.35s;
    z-index: 90;
  }

  .control-bar i {
    margin-top: 11px;
  }
</style>

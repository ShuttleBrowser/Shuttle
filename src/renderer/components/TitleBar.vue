<template>
  <div class="title-bar">
    <div class="title-bar-btn">
      <a href="#" class="title-bar-btn-minimize" onclick="shuttle.minimizeWindow()">
        <svg class="title-bar-btn-ctr">
          <use xmlns:xlink="http://www.w3.org/1999/xlink" href="assets/img/titlebar/window.svg#minimize-window"></use>
        </svg>
      </a>
      <a href="#" class="title-bar-btn-close" onclick="shuttle.quitWindow()">
        <svg class="title-bar-btn-ctr">
          <use xmlns:xlink="http://www.w3.org/1999/xlink" href="assets/img/titlebar/window.svg#close-window"></use>
        </svg>
      </a>
    </div>
  </div>
</template>

<script>
export default {}
</script>
<style src="@/assets/css/titlebar/titlebar.css"></style>
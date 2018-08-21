<template>
    <div class="bkms-bar">
        <a href="#" class="shuttle-btn"></a>
        <hr>
        <div class="bookmarks-zone">
            <a href="#" class="add-btn"></a>
            <a href="#" class="bubble-btn" id="id-1" title="twitter.com" onclick="shuttle.loadView('twitter.com', 1)" oncontextmenu="shuttle.askToRemoveBookmark(1, 'twitter.com')" onmouseover="shuttle.showControlBar('id-1', 'show')" style="background-image: url(https://abs.twimg.com/icons/apple-touch-icon-192x192.png);"></a>
        </div>
    </div>
</template>

<style src="./css/bookmarksBar.css"></style>
<script src="./js/bookmarksBar.js"></script>

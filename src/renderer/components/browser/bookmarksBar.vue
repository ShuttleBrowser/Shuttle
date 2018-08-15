<template>
    <div class="bkms-bar">
        <a href="#" class="shuttle-btn"></a>
        <hr>
        <div class="bookmarks-zone">
            <a href="#" class="add-btn"></a>
        </div>
    </div>
</template>

<script>
export default {
  name: 'bookmarksBar',
  methods: {}
}
</script>

<style scoped>
hr {
	margin-left: 5px;
	margin-right: 5px;
	margin-top: 2.5px;
}

.bkms-bar {
	position: absolute;
	top: 0;
	bottom: 100px;
	left: 0;
	width: 35px;
	background-color: #F4F4F4;
	text-align: center;
	transition: 0.5s;
}

.bookmarks-zone {
	position: absolute;
	top: 50px;
	left: 0;
	bottom: 0px;
	width: 35px;
	overflow: auto;
}

.shuttle-btn {
	margin-top: 11px;
	margin-left: 2px;
	display: block;
	width: 30px;
	height: 30px;
	border-radius: 50%;
	background-size: 60% auto;
	background-repeat: no-repeat;
	background-position: center; 
	background-image: url(./img/bar-icon.png);
	transition: 0.2s;
}

.shuttle-btn:hover {
	background-image: url(./img/bar-icon-hover.png);
}

.bubble-btn {
	margin-top: 4px;
	margin-left: 2.5px;
	display: block;
	width: 30px;
	height: 30px;
	border-radius: 50%;
	transition: 0.2s;
	background-color: white;
	background-size: 70% auto;
	background-color: #ffff;
	background-repeat: no-repeat;
	background-position: center; 
}
.bubble-btn:hover {
	border-radius: 25%;
}
</style>

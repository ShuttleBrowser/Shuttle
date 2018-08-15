<template>
    <div class="mainMenu">
        <hr>
        <a href="javascript:shuttle.showSearchBar()"><icon name="paper-plane"></icon></a>
        <a href="#" onclick="shuttle.changeUserAgent()" title="PC/Mobile view"><icon name="window-restore"></icon></a>
        <a href="#/auth"><icon name="cog"></icon></a>
    </div>
</template>

<script>

export default {
  name: 'mainMenu',
  methods: {}
}
</script>

<style scoped>
.mainMenu {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 35px;
	height: 100px;
	background-color: #F4F4F4;
	text-align: center;
}

.fa-icon {
  width: auto;
  height: 1em;
  font-size: 16px;
  margin-top: 7px;
  text-decoration:none;
  color: #CECECE;
  transition: 0.3s;
}

.fa-icon:hover {
	color: #7F7F7F
}

hr {
	margin-left: 5px;
	margin-right: 5px;
    margin-top: 2.5px;
    margin-bottom: 6px;
}
</style>

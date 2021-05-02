<script>
  import Item from './Item.svelte'
  import Add from './Add.svelte'
  
  export let bookmarks;
</script>

<style>
  .bar {
    width: 40px;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
  }
</style>

<div class="bar">
  <div class="home">
    <br>
    <Item active="false" type="home" url="shuttle://home" icon="/img/logo-square-gray.svg" />
    <hr>
  </div>
  <div class="links">
    {#each bookmarks as bookmark}
      <Item active="false" type="link" url="{bookmark.url}" icon="{bookmark.icon}" />
    {/each}

    <Add />
  </div>
  <div class="settings">

  </div>
</div>
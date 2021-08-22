<script>
  export let type
  export let url
  export let icon
  export let action
  export let active
</script>

<style>
  .item {
    display: block;
    width: 28px;
    height: 28px;
    background-size: 100% auto;
    background-repeat: no-repeat;
    background-position: center; 
    margin-top: 4px;
	  margin-left: 6px;
    transition: 0.2s;
  }
  .item-link {
    background-color: var(--dark-blue-light-color);
    border-radius: 50%;
  }
  .active {
    border: 2px solid var(--blue-color);
    box-sizing: border-box;
  }
  .home-active {
    color: var(--blue-color)
  }
  .active-bubble {
    height: 8px;
    width: 8px;
    background-color: var(--blue-color);
    margin-left: -4px;
    margin-top: 10px;
    position: absolute;
    border-radius: 50%;
  }
</style>

<div class="item-container">
  {#if active == "true"}
    <div class="active-bubble"></div>
  {/if}

  {#if type == "link"}
    <a class="item item-link {active == "true" ? "active" : ""}" href="#" action="{url}" style="background-image: url({icon});"></a>
  {:else}
    <a class="item {active == "true" ? "home-active" : ""}" href="#" action="{url}" style="background-image: url({icon});"></a>
  {/if}
</div>
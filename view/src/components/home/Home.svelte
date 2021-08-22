<script>
import Logo from "../../icons/logo.svelte";
</script>

<style>
  .home {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .icon {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    width: 250px;
    height: 250px;

    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

<div class="home">
  <div class="icon">
    <Logo width="50%" />
  </div>
</div>
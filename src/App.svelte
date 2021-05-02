<script>
  import Bar from './components/bar/Bar.svelte'
  import Home from './components/home/Home.svelte'

  const bookmarks = [
    {
      "id": 1,
      "type": "website",
      "url": "https://coldwire.org",
      "icon": "https://api.faviconkit.com/coldwire.org",
      "order": 1
    },
    {
      "id": 2,
      "type": "website",
      "url": "https://ecosia.org",
      "icon": "https://api.faviconkit.com/ecosia.org",
      "order": 0
    }
  ]
</script>

<style>
  .content {
    width: 372px;
    height: 100vh;

    position: fixed;
    left: 40px;
    top: 0;

    background-color: var(--dark-blue-extralight-color);
  }
</style>

<main>
  <Bar bookmarks={bookmarks} />
  <div class="content">
    <Home />
  </div>
</main>
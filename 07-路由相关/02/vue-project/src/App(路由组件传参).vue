<template>
  <header>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/about">About</RouterLink>
    <RouterLink to="/user/1">User</RouterLink>
    <!-- <RouterLink to="/profile/1">User</RouterLink> -->
    <RouterLink to="/product/a/b/c">Product</RouterLink>
    <RouterLink to="/search?q=vue">Search</RouterLink>
  </header>

  <RouterView name="left" />
  <!-- <RouterView /> -->
  <RouterView v-slot="{ Component }">
    <component
    :is="Component"
    view-prop="value"
    ></component>
  </RouterView>
  <RouterView name="right" />
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'

</script>


<style scoped>
header {
  display: flex;
  gap: 24px;
  line-height: 1.5;
  max-height: 100vh;
  font-size: 1.5em;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>

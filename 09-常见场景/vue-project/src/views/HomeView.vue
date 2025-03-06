<template>
  <div class="nav">
    <RouterLink v-for="route in routes" :key="route.name" :to="route.path">
      {{ route.meta?.page }}
    </RouterLink>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const routes = useRouter().getRoutes()

</script>

<style scoped>
.nav {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
</style>
<template>
  <div class="about">
    <h1>This is an User page</h1>
    <h2>UserId: {{  userId }}</h2>
  </div>
</template>
<script setup>
const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})
</script>
<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>

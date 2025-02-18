<template>
  <div>
    query: {{ query }}
  </div>
</template>

<script setup>
defineProps({
  query: {
    type: String
  }
})
</script>

<style scoped>

</style>
<template>
  <div>
    参数：{{  $route.params.name }}
  </div>
</template>

<script setup>
const props = defineProps({
  new: {
    type: Boolean
  }
})
console.log(props.new) // true
</script>

<style scoped>

</style>
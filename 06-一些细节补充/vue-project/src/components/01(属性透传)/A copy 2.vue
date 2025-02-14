<template>
  <!-- <B /> -->
  <div>
    <p v-bind="$attrs">A组件</p>
  </div>
</template>

<script setup>
import B from './B.vue'
// defineProps(['id', 'style'])
defineOptions({
  inheritAttrs: false
})
</script>

<style lang="scss" scoped>

</style>
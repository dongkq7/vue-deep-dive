<template>
  <div>
    B组件
    <C />
  </div>
</template>

<script setup>
import C from './C.vue'
</script>

<style scoped>
div {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 400px;
  height: 400px;
  border: 1px solid green;
}
</style>
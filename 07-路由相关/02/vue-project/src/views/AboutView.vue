<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<script setup>
import { onBeforeRouteLeave } from 'vue-router'

console.log('开始渲染About组件')


onBeforeRouteLeave((to, from, next) => {
  console.log('离开About组件')
  next()
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

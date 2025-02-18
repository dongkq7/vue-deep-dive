<template>
  <div class="about">
    <h1>This is an User page</h1>
    <h2>UserId: {{  userId }}</h2>
  </div>
</template>
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

console.log('开始渲染User组件')

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

onBeforeRouteUpdate((to, from, next) => {
  console.log('更新User组件')
  console.log('参数从', from.params.userId, '更新为', to.params.userId)
  next()
})

onBeforeRouteLeave((to, from, next) => {
  console.log('离开User组件')
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

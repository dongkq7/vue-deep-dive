<template>
  <div class="about">
    <h1>This is an Home page</h1>
  </div>
</template>
<script setup>
import { onBeforeRouteLeave } from 'vue-router'

console.log('开始渲染Home组件')

const props = defineProps({
  viewProp: {
    type: String
  }
})

console.log(props.viewProp) // value

onBeforeRouteLeave((to, from, next) => {
  console.log('离开Home组件')
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

<template>
  <div id="app">
    <nav>
      <!-- 这里使用的是内置组件router-link来做跳转 -->
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于</router-link>
      <router-link to="/user/1">用户1</router-link>
      <router-link to="/user/2">用户2</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script setup>

</script>
<style scoped>
nav {
  display: flex;
  gap: 32px;
}
</style>
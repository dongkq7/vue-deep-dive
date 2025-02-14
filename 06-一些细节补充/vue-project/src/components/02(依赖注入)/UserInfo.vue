<template>
  <div class="user-info">
    <h2>用户信息</h2>
    <p>{{ userInfo.name }}: {{ userInfo.age }}</p>
  </div>
</template>

<script setup>
import { inject } from 'vue'
const { userInfo } = inject('globalConfig')
</script>

<style scoped>
.user-info {
  width: 200px;
  border: 1px solid black;
}

</style>
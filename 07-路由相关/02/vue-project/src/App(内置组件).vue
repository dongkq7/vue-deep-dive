<template>
  <div id="app">
    <div class="container">
      <Sidebar />
      <div class="content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
</script>

<style>
.container {
  display: flex;
}

.content {
  flex-grow: 1;
  padding: 20px;
}
</style>

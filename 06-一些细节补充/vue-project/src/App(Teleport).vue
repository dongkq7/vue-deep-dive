<template>
  <div>
    <header>
      <h1>用户管理系统</h1>
    </header>
    <main>
      <UserManagement />
    </main>
  </div>
</template>

<script setup>
import UserManagement from './components/03(Teleport)/UserManagement.vue'
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

body {
  margin: 0;
  padding: 0;
}

header {
  background: #42b983;
  padding: 20px;
  color: white;
}

main {
  padding: 20px;
}
</style>

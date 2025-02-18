<template>
  <div id="app">
    <nav>
      <router-link to="/">主页</router-link>
      <router-link to="/user/1">用户页1</router-link>
      <router-link to="/user/2">用户页2</router-link>
      <router-link to="/admin">管理员</router-link>
    </nav>
    <router-view v-slot="{ Component, route }">
      <!-- <Transition :name="route.meta?.transition || 'fade'" mode="out-in">
        <component :is="Component" />
      </Transition> -->
      <Transition  name="slide-left" mode="out-in">
        <component :is="Component" :key="route.path"/>
      </Transition>
    </router-view>
  </div>
</template>
<script setup>
// import { computed} from 'vue'
// import { useRoute } from 'vue-router'

// const transitionName = computed(() => {
//   const route = useRoute()
//   if (route.meta?.transition) {
//     return route.meta.transition
//   }
//   return 'fade'
// })
</script>
<style scoped>
#app {
  font-family: Arial, sans-serif;
  background-color: #f8f9fa;
  margin: 0;
  padding: 0;
  text-align: center;
  height: 100vh;
}

nav {
  display: flex;
  justify-content: center;
  background-color: #343a40;
  padding: 10px;
}

nav a {
  margin: 0 15px;
  color: #fff;
  text-decoration: none;
}

nav a:hover {
  text-decoration: underline;
}

.router-link-exact-active {
  font-weight: bold;
  text-decoration: underline;
}

.fade-enter-active,
.fade-leave-active {
  transition: 0.1s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 添加不同的过渡样式 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.5s;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.5s;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}


</style>

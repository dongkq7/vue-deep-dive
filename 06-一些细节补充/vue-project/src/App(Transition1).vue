<template>
  <div>
    <button @click="show = !show">切换</button>
    <!-- 不使用transition -->
    <div :class="['fade', {enter: show, leave: !show}]">
      <h1>动画</h1>
      <p>淡入淡出</p>
    </div>

    <!-- 使用transiton -->
    <Transition>
      <div v-if="show">
        <h1>动画</h1>
        <p>淡入淡出</p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const show = ref(true)
</script>

<style scoped>
.fade {
  transition: 1s;
}
.enter {
  opacity: 1;
}
.leave {
  opacity: 0;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 1s;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.v-enter-to,
.v-leave-from {
  opacity: 1;
}
</style>
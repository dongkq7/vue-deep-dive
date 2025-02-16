<template>
  <div>
    <button @click="show = !show">切换</button>
    <Transition name="bounce" appear mode="out-in">
      <div v-if="show">
        <h1>动画</h1>
        <p>跳动</p>
      </div>
      <div v-else>
        <h1>hello</h1>
        <p>world</p>
      </div>
    </Transition>

    <Transition 
      enter-active-class="fade" 
      leave-active-class="fade"
      enter-to-class="enter"
      enter-from-class="leave"
      leave-from-class="enter"
      leave-to-class="leave"
    >
      <div v-if="show">
        <h1>动画2</h1>
        <p>淡入淡出</p>
      </div>
    </Transition>

    <!-- 仅仅是文本的变化，加入key -->
    <Transition name="fade" mode="out-in">
      <p :key="message">{{ message }}</p>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const show = ref(true)

const message = computed(() => {
  return show.value ? '你好' : '世界'
})
</script>

<style scoped>
.bounce-enter-active {
  animation: bounce-in 1s;
}
.bounce-leave-active {
  animation: bounce-in 1s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
.fade {
  transition: 1s;
}
.enter {
  opacity: 1;
}
.leave {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
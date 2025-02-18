<template>
  <div class="con">
    C组件
    <div v-if="message">{{  message }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import EventBus from '@/tools/EventBus'

const message = ref('')
function fn(msg) {
  message.value = msg
}
onMounted(() => {
  EventBus.on('aaa', fn)
})
</script>

<style scoped>
.con {
  width: 200px;
  height: 200px;
  border: 1px solid orangered;
}
</style>
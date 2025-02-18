<template>
  <div>
    A组件
    <B />
  </div>
  <button @click="send">向C组件传递消息</button>
</template>

<script setup>
import B from './B.vue'
import EventBus from '@/tools/EventBus'

function send() {
  EventBus.emit('aaa', '这是传递的消息')
}
</script>

<style scoped>
div {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 600px;
  height: 600px;
  border: 1px solid red;
}
</style>
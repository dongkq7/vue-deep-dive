<template>
  <div>
    <button @click="triggerError">触发错误</button>
    <ErrorLogger />
  </div>
</template>

<script setup>

function triggerError() {
  throw new Error('这是一个错误')
}
</script>

<style lang="scss" scoped>

</style>
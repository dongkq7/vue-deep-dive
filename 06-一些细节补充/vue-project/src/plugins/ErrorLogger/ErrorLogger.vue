<template>
  <div v-if="errors.length">
    <ul>
      <li v-for="item in errors" :key="item.time">
        {{ item.time }} - {{ item.message }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { reactive, onMounted} from 'vue'

const errors = reactive([])

onMounted(() => {
  // 改写console.error方法，打印错误时将错误信息加入数组中
  const consoleError = console.error

  console.error = (...args) => {
    errors.push({
      message: args[0],
      time: new Date().toDateString()
    })
    consoleError.apply(console, args)
  }
})

</script>

<style lang="scss" scoped>

</style>
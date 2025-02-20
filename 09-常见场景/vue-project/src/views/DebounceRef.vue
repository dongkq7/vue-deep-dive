<template>
  <div>
    <h1>customRef实现防抖</h1>
    <!-- <input type="text" @input="debounceHandler" :value="text"/> -->
    <input type="text" v-model="text"/>
    <div>{{ text }}</div>
  </div>
</template>

<script setup>
import { ref, customRef } from 'vue'
import { debounce } from 'lodash'
import { debounceRef } from '@/tools/debounceRef'

const text = debounceRef('')

// const text = ref('')

// let value = ''
// const text = customRef((track, trigger) => {
//   return {
//     get() {
//       track()
//       return value
//     },
//     set(newValue) {
//       value = newValue
//       trigger()
//     }
//   }
// })

// function handleInput(e) {
//   text.value = e.target.value
// }

// const debounceHandler = debounce(handleInput, 1000)
</script>

<style lang="scss" scoped>

</style>
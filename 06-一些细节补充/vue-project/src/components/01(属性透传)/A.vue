<template>
  <header></header>
  <main v-bind="$attrs"></main>
  <footer></footer>
</template>

<script setup>
import { useAttrs } from 'vue'
console.log('attrs', useAttrs())
</script>

<style lang="scss" scoped>

</style>
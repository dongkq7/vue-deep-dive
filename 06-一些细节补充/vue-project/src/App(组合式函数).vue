<template>
  <div>
    x: {{ x }}, y: {{ y }}
  </div>
</template>

<script setup>
import { useMouse } from './hooks/useMouse'
const { x, y } = useMouse()
</script>

<style lang="scss" scoped>

</style>
<template>
  <div>
    <VueDragResize
      :w="200"
      :h="150"
      :x="100"
      :y="100"
      :min-width="50"
      :min-height="50"
      @resizing="resizeHandle"
      @dragging="() => console.log('拖拽中')"
    >
      <div class="content">可拖拽和调整大小的元素</div>
    </VueDragResize>
  </div>
</template>

<script setup>
import VueDragResize from 'vue-drag-resize/src'
const resizeHandle = (size) => {
  console.log('调整了元素大小')
  console.log(size)
}
</script>

<style scoped>
.content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #42b983;
  color: white;
  text-align: center;
}
</style>
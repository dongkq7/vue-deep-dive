<template>
  <div class="list">
    <VirtualList :listData="listData" :itemSize="100"/>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VirtualList from '@/components/VirtualList.vue'

// 创建一个长列表的数据
let list = []
for (let i = 0; i < 10000; i++) {
  list.push({
    id: i + 1,
    value: `第${i + 1}条数据`
  })
}
const listData = ref(list)
</script>

<style scoped>
.list {
  height: 600px;
}
</style>
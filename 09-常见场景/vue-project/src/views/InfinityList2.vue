<template>
  <div class="list">
    <VirtualList :listData="data" :estimatedItemSize="100" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VirtualList from '@/components/VirtualList2.vue'

// 创建一个长列表的数据
let d = []
for (let i = 0; i < 10000; i++) {
  d.push({
    id: i + 1,
    value:  `${i % 2 === 0 ? '我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本我是一个长文本': '我是一行短文本'}`// 生成一个随机的句子
  })
}
const data = ref(d)
</script>

<style scoped>
.list { 
  height: 100vh;
}
</style>

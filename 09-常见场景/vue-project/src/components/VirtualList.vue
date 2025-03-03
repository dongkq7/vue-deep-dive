<template>
  <!-- 外层容器 -->
  <div ref="listRef" class="infinite-list-container" @scroll="handleScroll">
    <!-- 该元素高度为总列表的高度，目的是为了形成滚动 -->
    <div class="infinite-list-phantom" :style="{height: totalHeight + 'px'}"></div>
    <!-- 该元素为可视区域，里面就是一个一个列表项 -->
    <div class="infinite-list" :style="{ transform: `translateY(${startOffest}px)`}">
      <div
        class="infinite-list-item"
        v-for="item in visibleData"
        :key="item.id"
        :style="{
          height: `${itemSize}px`,
          lineHeight: `${itemSize}px`
        }"
      >
        {{ item.value }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
const props = defineProps({
  listData: {
    type: Array,
    default: () => []
  },
  itemSize: {
    type: Number,
    default: 150
  }
})

const listRef = ref(null)
const startIndex = ref(0)
const endIndex = ref(0)
const startOffest = ref(0)
const screenHeight = ref(0)

// 截取要展示的数据
const visibleData = computed(() => props.listData.slice(startIndex.value, Math.min(endIndex.value, props.listData.length)))
const totalHeight = computed(() => props.listData.length * props.itemSize)
const visibleCount = computed(() => Math.ceil(screenHeight.value / props.itemSize))


function handleScroll() {
  const scrollTop = listRef.value.scrollTop
  startIndex.value = Math.floor(scrollTop / props.itemSize)
  endIndex.value = startIndex.value + visibleCount.value
  startOffest.value = scrollTop - (scrollTop % props.itemSize)
}
onMounted(() => {
  screenHeight.value = listRef.value.clientHeight
  startIndex.value = 0
  endIndex.value = startIndex.value + visibleCount.value
})
</script>

<style scoped>
.infinite-list-container {
  position: relative;
  height: 100%;
  overflow: auto;
}
.infinite-list-phantom {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
.infinite-list {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  text-align: center;
}

.infinite-list-item {
  padding: 10px;
  color: #555;
  box-sizing: border-box;
  border-bottom: 1px solid #999;
}
</style>
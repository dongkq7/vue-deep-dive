<template>
  <!-- 外层容器 -->
  <div ref="listRef" class="infinite-list-container" @scroll="scrollHandler">
    <!-- 该元素高度为总列表的高度，目的是为了形成滚动 -->
    <div ref="virtualListRef" class="infinite-list-phantom"></div>
    <!-- 该元素为可视区域，里面就是一个一个列表项 -->
    <div ref="contentRef" class="infinite-list">
      <div class="infinite-list-item" ref="itemsRef" v-for="item in visibleData" :key="item.id">
        {{ item.value }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUpdated, nextTick } from 'vue'
const props = defineProps({
  listData: {
    type: Array,
    default: () => []
  },
  itemSize: {
    type: Number,
    default: 150
  },
  // 预估高度
  estimatedItemSize: {
    type: Number,
    required: true
  },
  // 缓冲区大小比例
  bufferScale: {
    type: Number,
    default: 1
  }
})

// 引用container元素
const listRef = ref(null)
// 可视区域高度
const screenHeight = ref(0)
// 开始索引
const startIndex = ref(0)
// 结束索引
const endIndex = ref(0)
// 初始的偏移量
// const startOffset = ref(0)

// 用于创建列表项元素的引用
const itemsRef = ref([])
// 用于引用phantom元素
const virtualListRef = ref(null)
// 用于引用list元素
const contentRef = ref(null)

// 缓存列表，用于存储列表项的位置信息
let positions = []
// 用于初始化每个列表项的位置信息
const initPostions = () => {
  positions = props.listData.map((_, index) => ({
    index, // 列表项的下标
    height: props.estimatedItemSize, // 列表项的高度，这里采用预估的高度
    top: index * props.estimatedItemSize, // 列表项的顶部位置，根据下标和预估高度计算
    bottom: (index + 1) * props.estimatedItemSize // 列表项的底部位置，也是根据下标和预估高度计算
  }))
}

// 列表总高度
// 现在因为列表项不定高，所以不能再采用这样的计算方式
// const virtualList = computed(() => props.listData.length * props.itemSize)
// 可显示的列表项数
const visibleCount = computed(() => Math.ceil(screenHeight.value / props.estimatedItemSize))

// 上缓冲区中展示的数量
const aboveCount = computed(() => {
  return Math.min(startIndex.value, props.bufferScale * visibleCount.value)
})

// 下缓冲区展示的数量
const belowCount = computed(() => {
  return Math.min(props.listData.length - endIndex.value, props.bufferScale * visibleCount.value)
})

// 列表显示数据
const visibleData = computed(() => {
    // props.listData.slice(startIndex.value, Math.min(endIndex.value, props.listData.length))
    const startIdx = startIndex.value - aboveCount.value
    const endIdx = endIndex.value + belowCount.value 
    return props.listData.slice(startIdx, Math.min(endIdx, props.listData.length))
})

const observer = ref(null)
const createObserver = () => {
  observer.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        let scrollTop = listRef.value.scrollTop
        startIndex.value = getStartIndex(scrollTop)
        endIndex.value = startIndex.value + visibleCount.value
        setStartOffset()
      }
    })
  },
  {
    root: listRef.value,
    rootMargin: '0px',
    threshold: 0.1
  }
  )
}
const observeItems = () => {
  itemsRef.value.forEach(item => {
    observer.value.observe(item)
  })
}
// const getStartIndex = (scrollTop) => {
//   // 找到第一个底部位置大于滚动高度的列表项
//   let item = positions.find((i) => i && i.bottom > scrollTop)
//   return item.index
// }

// 关于查找 startIndex 的方法，可以使用二分查找法来进行优化
// 因为缓存列表中的位置信息是有序的
const binarySearch = (list, value) => {
  let start = 0
  let end = list.length - 1
  let tempIndex = null
  while (start <= end) {
    let midIndex = parseInt((start + end) / 2)
    let midValue = list[midIndex].bottom
    if (midValue === value) {
      return midIndex + 1
    } else if (midValue < value) {
      start = midIndex + 1
    } else if (midValue > value) {
      // 此时就得减少end去一点点找了，直到tempIndex < midIndex 为止，就找到了第一个大于scrollTop的元素索引
      if (tempIndex === null || tempIndex > midIndex) {
        tempIndex = midIndex
      }
      end = end - 1
    }
  }
  return tempIndex
}
const getStartIndex = (scrollTop) => {
  return binarySearch(positions, scrollTop)
}

// // 滚动对应的处理函数
// const scrollHandler = () => {
//   // 这里要做的事情主要就是更新各项数据
//   let scrollTop = listRef.value.scrollTop
//   // startIndex.value = Math.floor(scrollTop / props.itemSize)
//   startIndex.value = getStartIndex(scrollTop)
//   endIndex.value = startIndex.value + visibleCount.value
//   // startOffset.value = scrollTop - (scrollTop % props.itemSize)
//   setStartOffset()
// }

onMounted(() => {
  // 获取可视区域高度
  screenHeight.value = listRef.value.clientHeight
  startIndex.value = 0
  endIndex.value = startIndex.value + visibleCount.value
  // 在组件挂载的时候，初始化列表项的位置信息
  initPostions()
  createObserver()
})

const updateItemsSize = () => {
  itemsRef.value.forEach((node, index) => {
    // 获取列表项实际的高度
    let height = node.getBoundingClientRect().height
    // 计算预估高度和真实高度的差值
    let oldHeight = positions[index].height // 拿到该项的预估高度
    let dValue = oldHeight - height
    if (dValue) {
      // 如果存在差值，那么就需要更新位置信息
      positions[index].bottom -= dValue
      positions[index].height = height
      // 接下来需要更新后续所有列表项的位置
      for (let i = index + 1; i < positions.length; i++) {
        positions[i].top = positions[i - 1].bottom
        positions[i].bottom -= dValue
      }
    }
  })
}

// 更新偏移量
const setStartOffset = () => {
  // let startOffset = startIndex.value >= 1 ? positions[startIndex.value - 1].bottom : 0
  let startOffset
  if (startIndex.value >= 1) {
    // 如果进入该分支，说明当前列表项不是第一个列表项，需要计算 startOffset
    // 计算当前可视区域第一项的顶部位置与考虑上方缓冲区后的有效偏移量
    let size =
      positions[startIndex.value].top -
      (positions[startIndex.value - aboveCount.value]
        ? positions[startIndex.value - aboveCount.value].top
        : 0)

    // 计算 startOffset：用当前可视区域第一个项的前一项的底部位置，减去上面计算出的 size，
    // 这个 size 表示的是在考虑缓冲区后需要额外平移的偏移量
    startOffset = positions[startIndex.value - 1].bottom - size
  } else {
    // 如果进入该分支，说明当前列表项是第一个列表项，那么 startOffset 就是 0
    startOffset = 0
  }
  contentRef.value.style.transform = `translateY(${startOffset}px)`
}

onUpdated(() => {
  // 这里之所以使用 nextTick，是为了确保DOM更新完毕后再去获取列表项的位置信息
  nextTick(() => {
    if (!itemsRef.value || !itemsRef.value.length) return
    // 1. 更新列表项的高度
    updateItemsSize()
    // 2. 更新虚拟列表的高度
    virtualListRef.value.style.height = positions[positions.length - 1].bottom + 'px'
    // 3. 更新列表的偏移量
    setStartOffset()
    // 观察列表项
    observeItems()
  })
})

watch(() => props.listData, initPostions)
</script>

<style scoped>
.infinite-list-container {
  height: 100%;
  overflow: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;
}

.infinite-list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.infinite-list {
  left: 0;
  right: 0;
  top: 0;
  position: absolute;
  text-align: center;
}

.infinite-list-item {
  padding: 10px;
  color: #555;
  box-sizing: border-box;
  border-bottom: 1px solid #999;
}
</style>

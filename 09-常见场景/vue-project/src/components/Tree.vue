<template>
  <div class="tree-node" v-for="(node, index) in data" :key="node.label">
    <div class="node-label">
      <!-- 折叠展开按钮 -->
      <button 
        v-if="hasChildren(node)" 
        class="toggle-button" 
        @click="isOpenArr[index] = !isOpenArr[index]"
      >
        {{ isOpenArr[index] ? '▼' : '►' }}
      </button>
      <!-- 复选框 -->
      <input 
        v-if="showCheckbox" 
        type="checkbox" 
        :checked="node.checked"
        @change="handleChecked(node)"
      />
      <!-- 节点名称 -->
      <label :for="node.label">{{ node.label }}</label>
    </div>
    <!-- 递归渲染 -->
    <template v-if="transition">
      <Transition
        name="expand"
        @before-enter="beforeEnter"
        @enter="enter"
        @after-enter="afterEnter"
        @before-leave="beforeLeave"
        @leave="leave"
        @after-leave="afterLeave"
      >
        <div v-if="node.children" v-show="isOpenArr[index]">
          <Tree 
            :data="node.children" 
            :show-checkbox="showCheckbox" 
            :transition="transition"
            @update-parent-node="updateParentNode(node)"
            @update-child-check="$emit('updateChildCheck', data)"
          />
        </div>
      </Transition>
    </template>
    <template v-else>
      <div v-if="node.children" v-show="isOpenArr[index]">
        <Tree 
          :data="node.children" 
          :show-checkbox="showCheckbox" 
          :transition="transition" 
          @update-parent-node="updateParentNode(node)" 
          @update-child-check="$emit('updateChildCheck', data)"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  showCheckbox: {
    type: Boolean,
    default: true
  },
  transition: {
    type: Boolean,
    default: true
  }
})

const emits = defineEmits(['updateParentNode', 'updateChildCheck'])
// 每一层都需要有一个状态来控制是折叠还是展开
const isOpenArr = ref(props.data.map(() => false))
// 该节点下是否有子节点
const hasChildren = (node) => {
  return node.children && node.children.length > 0
}

// 处理节点选择逻辑
const handleChecked = (node) => {
  node.checked = !node.checked
  // 1. 更新子节点
  if (hasChildren(node)) {
    updateChildNode(node)
  }
  // 2. 更新父节点
  emits('updateParentNode')

  // 3. 通知最新数据
  emits('updateChildCheck', props.data)
}

const updateChildNode = (node) => {
  node.children.forEach(child => {
    child.checked = node.checked
    if (hasChildren(child)) {
      updateChildNode(child)
    }
  })
}

const updateParentNode = (pNode) => {
  const childChecked = pNode.children.every(node => node.checked)
  pNode.checked = childChecked
  emits('updateParentNode')
}

// 过渡动画相关的方法
function beforeEnter(el) {
  el.style.maxHeight = '0'
  el.style.opacity = '0'
  el.style.overflow = 'hidden'
}

function enter(el) {
  el.style.transition = 'max-height 0.3s ease, opacity 0.3s ease'
  el.style.maxHeight = el.scrollHeight + 'px'
  el.style.opacity = '1'
}

function afterEnter(el) {
  el.style.maxHeight = 'none'
}

function beforeLeave(el) {
  el.style.maxHeight = el.scrollHeight + 'px'
  el.style.opacity = '1'
  el.style.overflow = 'hidden'
}

function leave(el) {
  el.style.transition = 'max-height 0.3s ease, opacity 0.3s ease'
  el.style.maxHeight = '0'
  el.style.opacity = '0'
}

function afterLeave(el) {
  el.style.maxHeight = 'none'
}

</script>

<style scoped>
.tree-node {
  margin-left: 20px;
  font-family: Arial, sans-serif;
}
.node-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
}
.toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  color: black;
}
</style>
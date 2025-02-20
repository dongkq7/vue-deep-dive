# 一、树形组件的封装

## 支持的属性

1. data：树形结果的数据，例如：

```javascript
const data = ref([
  {
    label: '水果',
    checked: false, // 添加初始勾选状态
    children: [
      {
        label: '苹果',
        checked: false,
        children: [
          {
            label: '红富士',
            checked: false
          },
          {
            label: '黄元帅',
            checked: false
          }
        ]
      },
    ]
  },
])
```

1. show-checkbox：是否显示复选框
2. transition：是否应用过渡效果
3. 支持事件 @update:child-check，可以获取最新的状态

使用示例：

```vue
<Tree
  :data="data"
  :show-checkbox="true"
  :transition="true"
  @update:child-check="handleChildCheck"
/>
```



## 实现

### 根据data渲染出树形结构

```vue
<template>
  <div class="tree-node" v-for="node in data" :key="node.label">
    <div class="node-label">
      <!-- 折叠展开按钮 -->
      <button class="toggle-button">►</button>
      <!-- 复选框 -->
      <input v-if="showCheckbox" type="checkbox" />
      <!-- 节点名称 -->
      <label :for="node.label">{{ node.label }}</label>
    </div>
    <!-- 递归渲染 -->
    <Tree :data="node.children" :show-checkbox="showCheckbox" :transition="transition" />
  </div>
</template>

<script setup>
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
```

模板会被编译成渲染函数，在内部使用Tree组件，实际上是在递归调用渲染函数

### 实现展开/收起效果

```javascript
// 每一层都需要有一个状态来控制是折叠还是展开
const isOpenArr = ref(props.data.map(() => false))
// 该节点下是否有子节点
const hasChildren = (node) => {
  return node.children && node.children.length > 0
}
```

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739934266991-d535695e-214e-4632-9269-66f3d00aba7d.png)

### 添加展开/收起过渡效果

过渡效果可以结合Transition组件加上钩子函数来实现。

1. 根据传递的transition状态来控制是否使用Transition组件

```vue
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
      <Tree :data="node.children" :show-checkbox="showCheckbox" :transition="transition" />
    </div>
  </Transition>
</template>
<template v-else>
  <div v-if="node.children" v-show="isOpenArr[index]">
    <Tree :data="node.children" :show-checkbox="showCheckbox" :transition="transition" />
  </div>
</template>
```

1. 添加钩子函数逻辑

```javascript
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
```

- **max-height: 0** 将元素的最大高度限制为 0。这意味着元素在垂直方向上实际上不会有任何可见的空间，它的内容会被隐藏，除非通过其他样式（如 `overflow: visible`）来显示。常用于实现元素的隐藏或收缩效果，结合过渡效果可以实现平滑的展开和收缩动画。
- **max-height: none** 表示元素没有最大高度限制。元素的高度将根据其内容和其他相关样式（如 `height`、`min-height` 等）来确定。如果没有设置其他高度限制，元素会根据内容自动调整高度。

将 `**max-height**` 设置为 `**el.scrollHeight**` 是一种常见的技巧，它常被用于实现元素平滑展开和收缩的动画效果:

- `**el.scrollHeight**`：这是一个 DOM 元素的属性，代表了元素内容的总高度，包含了由于溢出而在视觉上不可见的部分。也就是说，它反映了元素在不考虑滚动条和溢出隐藏的情况下，为了完整显示其内容所需要的高度。
- `**max-height**`：是 CSS 属性，用于设定元素的最大高度。当元素内容高度小于或等于 `max-height` 时，元素高度由内容决定；当内容高度超过 `max-height` 时，元素高度会被限制为 `max-height`，超出部分可能会根据 `overflow` 属性的设置进行处理（如隐藏、滚动等）。

当把 `**max-height**` 设置为 `**el.scrollHeight**` 时，就相当于给元素设置了一个刚好能容纳其所有内容的最大高度，从而可以让元素在这个高度范围内自由展开显示全部内容。

### 选中逻辑处理

这里有两点需要注意：

- 父节点 选中/取消 会控制所有的子节点 选中/取消 状态
- 子节点的 选中/取消 状态也会影响父节点



1. 为checked双向绑定checked，并添加change事件

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739952191574-bf58de1a-322d-4796-bb9c-79452923caf3.png)

1. 编写处理逻辑，在处理逻辑上需要处理两部分

- 更新子节点状态
- 更新父节点状态

更新子节点状态时，如果存在子节点，根据当前节点状态去更新即可。然后再递归进行处理。

更新父节点时，需要拿到父节点，如何获取呢？

- 这里有个技巧就是，可以定义一个emit事件，然后Tree组件上去监听，因为Tree组件在递归渲染的时候是可以拿到父节点的，事件触发时去调取相应函数并传入父节点即可实现。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739950882607-5bbb8942-721f-4de4-a280-a7536008e6f6.png)

```javascript
const emits = defineEmits(['updateParentNode'])

// 处理节点选择逻辑
const handleChecked = (node) => {
  node.checked = !node.checked
  // 1. 更新子节点
  if (hasChildren(node)) {
    updateChildNode(node)
  }
  // 2. 更新父节点
  emits('updateParentNode')
}

const updateChildNode = (node) => {
  node.children.forEach(child => {
    child.checked = node.checked
    if (hasChildren(child)) {
      updateChildNode(child)
    }
  })
}
```

### 实时通知树形组件数据最新情况

定义一个emit事件，在change事件处理中去emit父组件并传入最新数据即可。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739952256828-0a8bd0b7-c846-494f-ba25-68f4058da862.png)

需要注意的是，在组件内部递归渲染的Tree上也要同样去监听，通过`$emit`去向上一层Tree组件发送事件，不然如果修改子树的节点状态时最外面监听不到改变。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739952603147-87b4058b-9268-4f99-9540-2ba38f2ecd5c.png)

这样在最外层便能够获取到最新数据：

```vue
<template>
  <Tree 
    :data="data"
    :show-checkbox="true"
    :transition="true"
    @updateChildCheck="updateChildCheck"
  />
</template>

<script setup>

const updateChildCheck = (data) => {
  console.log('最新数据...', data)
}
</script>

<style scoped>

</style>
```

# 二、使用customRef实现防抖

## 实现防抖的基本方式

首先是一个防抖最基本的实现：

```vue
<template>
  <div class="container">
    <input @input="debounceInputHandler" type="text" />
    <p class="result">{{ text }}</p>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { debounce } from 'lodash'
const text = ref('')

function inputHandler(e) {
  text.value = e.target.value
}

const debounceInputHandler = debounce(inputHandler, 1000)
</script>
<style scoped>
.container {
  width: 80%;
  margin: 1em auto;
}
.result {
  color: #333;
}
.container input {
  width: 100%;
  height: 30px;
}
</style>
```

假设Vue给我们提供了一个防抖的ref：

```vue
<template>
  <div class="container">
    <input v-model="text" type="text" />
    <p class="result">{{ text }}</p>
  </div>
</template>
<script setup>
import { debounceRef } from 'vue'
const text = debounceRef('', 1000)
</script>
```

上面的设想是美好的，代码能够简洁很多，但是 Vue 并没有给我们提供 debounceRef.

怎么办呢？就需要我们自己去实现了。

## CustomRef

Vue为我们提供了一个CustomRef API：

```javascript
function customRef<T>(factory: CustomRefFactory<T>): Ref<T>

type CustomRefFactory<T> = (
  track: () => void,
  trigger: () => void
) => {
  get: () => T
  set: (value: T) => void
}
```

### 基本使用方式

下面是 customRef 的一个基本使用示例：

```javascript
import { customRef } from 'vue'
let value = ''
const text = customRef(() => {
  return {
    get() {
      console.log('get')
      return value
    },
    set(val) {
      value = val
      console.log('set')
    }
  }
})
console.log(text)
console.log(text.value)
text.value = 'test'
```

官方文档：https://vuejs.org/api/reactivity-advanced.html#customref

### 通过CustomRef实现ref原有功能

通过 customRef 实现 ref 原有的功能：

```vue
<template>
  <div class="container">
    <input v-model="text" type="text" />
    <p class="result">{{ text }}</p>
  </div>
</template>
<script setup>
import { customRef } from 'vue'
let value = '111'
const text = customRef((track, trigger) => {
  return {
    get() {
      track()
      console.log('get方法被调用')
      return value
    },
    set(val) {
      trigger()
      console.log('set方法被调用')
      value = val
    }
  }
})
</script>
<style scoped>
.container {
  width: 80%;
  margin: 1em auto;
}
.result {
  color: #333;
}
.container input {
  width: 100%;
  height: 30px;
}
</style>
```

### 实现防抖

下面是通过自定义ref来实现防抖：

```javascript
import { customRef } from 'vue'
import { debounce } from 'lodash'
export function debounceRef(value, delay = 1000) {
  return customRef((track, trigger) => {
    let _value = value

    const _debounce = debounce((val) => {
      _value = val
      trigger() // 派发更新
    }, delay)

    return {
      get() {
        track() // 收集依赖
        return _value
      },
      set(val) {
        _debounce(val)
      }
    }
  })
}
```
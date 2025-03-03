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

# 三、懒加载

## 检查元素可见性

IntersectionObserver 是一个**现代浏览器 API**，用于检测一个元素（或其子元素）相对于视口或某个祖先元素的可见性变化。

### 基本用法

```javascript
const ob = new IntersectionObserver(callback, options);
```

1. **callback**: **当被观察元素的可见性变化时调用的回调函数**，callback **一开始会触发一次，确认当前的可视状**态（无论当前是可见还是不可见），之后在每次可视状态发生改变时会触发。回调函数里面有两个参数：

- entries: 一个数组，包含所有被观察元素的 IntersectionObserverEntry 对象，每个对象包含以下属性：

- boundingClientRect: 被观察元素的矩形区域信息。
- intersectionRatio: 被观察元素的可见部分与整个元素的比例。
- intersectionRect: 可见部分的矩形区域信息。
- isIntersecting: 布尔值，表示元素是否与根元素相交。
- rootBounds: 根元素的矩形区域信息。
- target: 被观察的目标元素。
- time: 触发回调的时间戳。

- observer: IntersectionObserver 实例本身。

1. **options**: 配置对象，用于**定制观察行为**

- root：指定用作视口的元素。默认值为 null，表示使用浏览器视口作为根元素。
- rootMargin: 类似于 CSS 的 margin 属性，**定义根元素的外边距**，用于扩展或缩小根元素的判定区域。可以用像素或百分比表示，例如 '10px' 或 '10%'或'-100px'等。
- threshold: 是一个 0～1 之间的值，表示一个触发的阈值，如果是 0，只要目标元素一碰到 root 元素，就会触发，如果是1，表示目标元素完全进入 root 元素范围，才会触发。设置观察元素进入到根元素的百分比。

有了 observer 实例对象后，要观察哪个元素，直接通过 observe 方法来进行观察即可，取消观察通过 unobserve 方法。

```javascript
// 开始观察
ob.observe(elementA);
ob.observe(elementB);

// 停止观察
ob.unobserve(element);
```



### 示例

```javascript
const target = document.querySelector('.target')


const callback = (entries, observer) => {
  entries.forEach(entry => {
    console.log(entry)
    if (entry.isIntersecting) {
      console.log('目标元素进入视口')
    } else {
      console.log('目标元素离开')
    }
  })
}

const ob = new IntersectionObserver(callback, {
  root: null,
  rootMargin: '0px',
  threshold: 0
})

ob.observe(target)
const target = document.querySelector('.target')

const callback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('出现了')
    } else {
      console.log('离开了')
    }
  })
}

const ob = new IntersectionObserver(callback, {
  root: document.querySelector('.container'),
  rootMargin: '-50px', // target高度为100，此时出现一半时isIntersecting才为true
  threshold: 0
})

ob.observe(target)
```

## 懒加载

懒加载含义：当出现的时候再加载。

懒加载核心原理：img 元素在 src 属性有值时，才会去请求对应的图片地址，那么我们可以先给图片一张默认的占位图：

<img src="占位图.png">

再设置一个自定义属性 data-src，对应的值为真实的图片地址：

<img src="占位图.png" data-src="图片真实地址">

之后**判断当然这个 img 元素有没有进入可视区域**，如果进入了，就把 data-src 的值赋给 src，让真实的图片显示出来。这就是图片懒加载的基本原理。

不过这里对于判断 img 元素有没有进入可视区域，有着新旧两套方案。

### 旧方案

早期的方案是监听页面的滚动：

window.addEventListener("scroll", ()=>{})

当 img 标签的顶部到可视区域顶部的距离，小于可视区域高度的时候，我们就认为图片进入了可视区域，画张图表示：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1740924805769-48d03817-1a4f-4085-96fa-3cc7bcc8b998.png)

示例代码：

```javascript
window.addEventListener("scroll", () => {
  const img = document.querySelectorAll('img')
  img.forEach(img => {
    const rect = img.getBoundingClientRect();
    console.log("rect", rect);
    if (rect.top < document.body.clientHeight) {
      // 当前这张图片进入到可视区域
      // 做 src 的替换
      img.src = img.dataset.src
    }
  })
})
```

这种方案触发的非常频繁，非常耗费性能

### 新方案

使用 `**IntersectionObserver**` 来实现。

```javascript
let observer = new IntersectionObserver(
  (entries, observer) => {
    for(const entrie of entries){
      if(entrie.isIntersection){
        // 说明当前的图片和根元素产生了交叉
        const img = entrie.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    }
  },
  {
    root: null,
    rootMargin: "0px 0px 0px 0px",
    threshold: 0.5
  }
);
// 先拿到所有的图片元素
const imgs = document.querySelectorAll("img");
imgs.forEach((img) => {
  //观察所有的图片元素
  observer.observe(img);
});
```

## Vue相关库

### 安装

npm install --save vue3-observe-visibility

### 注册

```vue
import { createApp } from 'vue';
  import App from './App.vue';
  // 引入该第三方库
  import { ObserveVisibility } from 'vue3-observe-visibility';

  const app = createApp(App);

  // 将其注册成为一个全局的指令
  app.directive('observe-visibility', ObserveVisibility);

  app.mount('#app');
```

### 使用

```vue
<template>
  <div>
    <h1>Vue Observe Visibility Example</h1>
    <div
      v-observe-visibility="{
        callback: visibilityChanged,
        intersection: {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
      }
      }"
      class="observed-element"
      >
      观察这个元素的可见性
    </div>
  </div>
</template>

<script setup>
  function visibilityChanged(isVisible) {
    console.log('元素可见性变化:', isVisible)
  }
</script>

<style scoped>
  .observed-element {
    height: 200px;
    margin-top: 1000px;
    background-color: lightcoral;
  }
</style>
```

### 案例-实现图片懒加载

09-常见场景 -> vue-project -> views -> LazyLoad.vue
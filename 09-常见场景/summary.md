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



# 四、虚拟列表

长列表常见的 3 种处理方式：

1. 懒加载
2. 时间分片
3. 虚拟列表

## 懒加载

懒加载的原理在于：只有视口内的内容会被加载，其他内容在用户滚动到视口时才会被加载。这可以显著减少初次加载的时间，提高页面响应速度。这样的好处在于：

1. 节省带宽
2. 提升用户体验

懒加载的缺点：懒加载只能应对数据不是太多的情况。如果列表项有几万甚至几十万项，最终会有对应数量的 DOM 存在于页面上，严重降低页面性能。

页面中的DOM元素越多，浏览器在重新绘制的时候压力越大

## 时间分片

时间分片的本质是通过 **requestAnimationFrame**，**由浏览器来决定回调函数的执行时机**。大量的数据会被分多次渲染，每次渲染对应一个片段。在每个片段中处理定量的数据后，会将主线程还给浏览器，从而实现快速呈现页面内容给用户。

时间分片的缺点：

1. 效率低
2. 不直观（如果用户直接把滚动条拖动到最后，那么看到的效果就是数据是一片一片出来的）
3. 性能差

总结：无论是懒加载还是时间分片，最终都是将完整数量的列表项渲染出来，这在面对列表项非常非常多的时候，页面性能是比较低的。

## 虚拟列表

原理：设置一个可视区域，然后用户在滚动列表的时候，本质上是**动态修改可视区域里面的内容**。

例如，一开始渲染前面 5 个项目

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1740926264942-9225af94-afbd-481a-b303-dc4f1c5621d5.png)

之后用户进行滚动，就会动态的修改可视区域里面的内容，如下图所示：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1740926264937-b5fae894-358b-4825-8078-8ae27abd6fa6.png)

也就是说，始终渲染的只有可视区的那 5 个项目，这样能够极大的保障页面性能。

### 实现定高的虚拟列表

这里所指的定高是说列表项的每一项高度相同

涉及到的信息：

1. 可视区域起始数据索引(startIndex)
2. 可视区域结束数据索引(endIndex)
3. 可视区域的数据（通过startIndex与endIndex截取整个list来获取）
4. 整个列表中的偏移位置 startOffset

如下图所示：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1740926265054-2691d1c7-1204-4f0a-b355-218e76104ee0.png)

接下来整个虚拟列表的设计如下：

```html
<div class="infinite-list-container">
  <!-- 该元素高度为总列表的高度，目的是为了形成滚动 -->
  <div class="infinite-list-phantom"></div>
  <!-- 该元素为可视区域，里面就是一个一个列表项 -->
  <div class="infinite-list">
    <!-- item-1 -->
    <!-- item-2 -->
    <!-- ...... -->
    <!-- item-n -->
  </div>
</div>
```

- infinite-list-container：可视区域的容器 
- infinite-list-phantom：容器内的占位，高度为总列表高度，用于形成滚动条 
- infinite-list：列表项的渲染区域

如下图所示：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1740926264966-04e7bcad-2569-46a3-acc3-03a4c1367acf.png)

接下来监听 infinite-list-container 的 scroll 事件，获取滚动位置的 scrollTop，因为回头需要设置 list 向下位移的距离

- 假定可视区域高度固定，称之为 screenHeight
- 假定列表每项高度固定，称之为 itemSize
- 假定列表数据称之为 listData（就是很多的列表数据，几万项、几十万项列表数据）
- 假定当前滚动位置称之为 scrollTop



那么我们能够计算出这么一些信息：

1. **列表总高度 ：listHeight = listData.length \* itemSize**
2. **可显示的列表项数 : visibleCount = Math.ceil(screenHeight / itemSize)**
3. **数据的起始索引: startIndex = Math.floor(scrollTop / itemSize)**
4. **数据的结束索引: endIndex = startIndex + visibleCount**
5. **列表显示数据为: visibleData = listData.slice(startIndex, endIndex)**



当发生滚动后，由于渲染区域相对于可视区域发生了偏移，因此我们需要计算出这个偏移量，然后使用 transform 重新偏移回可视区域。

偏移量的计算：startOffset = scrollTop - (scrollTop % itemSize)



思考🤔：为什么要减去 scrollTop % itemSize ，为什么偏移量不能直接是scrollTop呢？

答案：之所以要减去 scrollTop % itemSize，是为了将 scrollTop 调整到一个与 itemSize 对齐的位置，避免显示不完整的列表项



![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1740926264946-9e1c3505-f972-438f-9287-44a0241dcad5.png)

实现定高的虚拟列表

09-常见场景/vue-project/src/views/InfinityList.vue



定高的虚拟列表存在一些问题，或者说可以优化的地方：

1. 动态高度
2. 白屏现象
3. 滚动事件触发频率过高

### 虚拟列表优化

遗留问题：

- 动态高度
- 白屏问题
- 滚动事件触发频率过高

#### 1、动态高度方面的优化

在实际应用中，列表项目里面可能包含一些可变内容，导致列表项高度并不相同。

不固定的高度就会导致：

- 列表总高度：listHeight = listData.length * itemSize 
- 偏移量的计算：startOffset = scrollTop - (scrollTop % itemSize)
- 数据的起始索引 startIndex = Math.floor(scrollTop / itemSize) 

这些属性的计算**不能**再通过上面的方式来计算。因此我们会遇到这样的一些问题：

1. 如何获取真实高度？
2. 相关属性该如何计算？
3. 列表渲染的项目有何改变？

解决思路：

##### 1-1、如何获取真实高度？

- 如果能获得列表项高度数组，真实高度问题就很好解决。但在实际渲染之前是**很难拿到每一项的真实高度**的，所以我们采用**预估一个高度**渲染出真实 DOM，再根据 DOM 的实际情况去更新真实高度。
- 创建一个**缓存列表**，其中列表项字段为 索引、高度与定位，并**预估列表项高度**用于**初始化缓存列表**。在渲染后根据 DOM 实际情况**更新缓存列表**。

```vue
<template>
  <!-- 外层容器 -->
  <div ref="listRef" class="infinite-list-container" @scroll="handleScroll">
    <div class="infinite-list-phantom"></div>
    <div class="infinite-list">
      <div
        ref="itemsRef"
        class="infinite-list-item"
        v-for="item in visibleData"
        :key="item.id"
      >
        {{ item.value }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUpdated, nextTick, watch } from 'vue'
const props = defineProps({
  listData: {
    type: Array,
    default: () => []
  },
  // 每项的预估高度
  estimatedItemSize: {
    type: Number,
    required: true
  }
})

// 缓存列表：存储每一项的位置信息
let positions = []
const initPostions = () => {
  positions = props.listData.map((_, index) => ({
    index, // 列表项的下标
    height: props.estimatedItemSize, // 列表项的高度，这里采用预估的高度
    top: index * props.estimatedItemSize, // 列表项的顶部位置，根据下标和预估高度计算
    bottom: (index + 1) * props.estimatedItemSize // 列表项的底部位置，也是根据下标和预估高度计算
  }))
}

const itemsRef = ref([])
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
onMounted(() => {
  // 初始化列表项位置信息
  initPostions()
})

watch(() => props.listData, initPostions)

onUpdated(async () => {
  await nextTick() // 确保dom已经更新完成
  if (!itemsRef.value || !itemsRef.value.length) return
  此时去根据真实的DOM高度去更新缓存的位置信息
  updateItemsSize()
})
</script>
```

##### 1-2、相关的属性该如何计算？

- 显然以前的计算方式都无法使用了，因为那都是针对固定值设计的。
- 于是我们需要 **根据缓存列表重写计算属性、滚动回调函数**，例如列表总高度的计算可以使用缓存列表最后一项的定位字段的值。

```vue
<template>
  <!-- 外层容器 -->
  <div ref="listRef" class="infinite-list-container" @scroll="handleScroll">
    <!-- 该元素高度为总列表的高度，目的是为了形成滚动 -->
    <div ref="virtualListRef" class="infinite-list-phantom"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const virtualListRef = ref(null)


watch(() => props.listData, initPostions)

onUpdated(async () => {
  await nextTick() // 确保dom已经更新完成
  //...
  // 更新虚拟列表的高度
  virtualListRef.value.style.height = positions[positions.length - 1].bottom + 'px'
})
</script>
```

- 对于偏移量可以通过缓存列表中的startIndex的前一个的bottom获取

```vue
<template>
  <!-- 外层容器 -->
  <div ref="listRef" class="infinite-list-container" @scroll="handleScroll">
    <!-- 该元素高度为总列表的高度，目的是为了形成滚动 -->
    <div ref="virtualListRef" class="infinite-list-phantom"></div>
    <!-- 该元素为可视区域，里面就是一个一个列表项 -->
    <div ref="contentRef" class="infinite-list">
      <div
        ref="itemsRef"
        class="infinite-list-item"
        v-for="item in visibleData"
        :key="item.id"
      >
        {{ item.value }}
      </div>
    </div>
  </div>
</template>

<script setup>
//...
const contentRef = ref(null)
const setStartOffset = () => {
  const startOffset = startIndex.value >= 1 ? positions[startIndex.value - 1].bottom : 0
  contentRef.value.style.transform = `translateY(${startOffset})px`
}

onUpdated(async () => {
  await nextTick() // 确保dom已经更新完成
  //...
  setStartOffset()
})
</script>
```

##### 1-3、列表渲染的项目有何改变？

- 因为用于渲染页面元素的数据是根据 **开始/结束索引** 在 **数据列表** 中筛选出来的，所以只要保证索引的正确计算，那么**渲染方式是无需变化**的。
- 对于开始索引，我们将原先的计算公式改为：在 **缓存列表** 中搜索第一个底部定位大于 **列表垂直偏移量** 的项并返回它的索引

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1740981728574-273db51d-5c86-4068-b6c2-371cdc3e2480.png)

- 对于结束索引，它是根据开始索引生成的，无需修改。

```javascript
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
```

#### 2、解决白屏问题

由于仅渲染可视区域的元素。此时如果用户滚动过快，会出现白屏闪烁的现象。

之所以会有这个现象，是因为先加载出来的是白屏（没有渲染内容），然后迅速会被替换为表格内容，从而出现闪烁的现象。

并且这种现象在越低性能的浏览器上面表现得越明显。

解决思路：

为了让页面的滚动更加平滑，我们可以在原先列表结构的基础上加上**缓冲区**，也就是整个渲染区域由 **可视区 + 缓冲区** 共同组成，这样就给滚动回调和页面渲染留出了更多的时间。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1740997008867-48e51cc1-5ce6-4af8-99a4-bda46e8c5cb9.png)

首先可以增加一个`bufferScale`属性，用来表示缓冲区的占可视区域的比例。

这样设计后，缓冲区的数据会进入到可视区域，然后我们要做的就是更新缓冲区的数据。

代码片段：

```javascript
// 上方缓冲区计算
const aboveCount = computed(() => {
  // 缓冲区列表项个数的计算，其实就是可视区显示个数 * 缓冲比例
  // 但是考虑到可能存在当前虚拟列表处于最顶端，所以需要和 startIndex 做一个比较，取最小值
  return Math.min(startIndex.value, props.bufferScale * visibleCount.value)
})

// 下方缓冲区计算
const belowCount = computed(() => {
  return Math.min(props.listData.length - endIndex.value, props.bufferScale * visibleCount.value)
})
```

假设我们有如下场景：

- 总共有 100 项数据（props.listData.length = 100）
- 当前可视区域显示 10 项（visibleCount.value = 10）
- bufferScale 设置为 1
- 当前 startIndex.value = 20（表示当前可视区域从第21项开始显示）
- 当前 endIndex.value = 29（表示当前可视区域显示到第30项）

计算结果如下：

```javascript
// 计算结果为 Math.min(20, 10) = 10
const aboveCount = Math.min(20, 1 * 10)

// 计算结果为 Math.min(70, 10) = 10
const belowCount = Math.min(100 - 30, 1 * 10)
```

因此最终上下的缓冲区的缓冲列表项目均为10.

另外关于整个列表的渲染，之前是根据索引来计算的，现在就需要额外加入上下缓冲区大小重新计算，如下所示：

```javascript
const visibleData = computed(() => {
  let startIdx = startIndex.value - aboveCount.value
  let endIdx = endIndex.value + belowCount.value
  return props.listData.slice(startIdx, endIdx)
})
```

最后，因为多出了缓冲区域，所以偏移量也要根据缓冲区来重新进行计算。

至于这个 startOffset 具体是怎么计算的，如下图所示：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1740997008877-a573c962-2419-43f4-822e-bedfbf16df14.png)![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1740998201421-bb1e3797-20aa-409d-b5e2-1ca828328316.png)

```javascript
const setStartOffset = () => {
  let startOffset

  // 检查当前可视区域的第一个可见项索引是否大于等于1（即当前显示的内容不在列表最开始的地方）
  if (startIndex.value >= 1) {
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
    // 如果当前的 startIndex 为 0，表示列表显示从最开始的地方开始，没有偏移量
    startOffset = 0
  }

  // 设置内容容器的 transform 属性，使整个内容平移 startOffset 像素，以确保正确的项对齐在视口中
  content.value.style.transform = `translate3d(0,${startOffset}px,0)`
}
```



setStartOffset 方法重写完毕后，整个白屏闪烁问题也就完美解决了。

#### 3、解决滚动事件触发频率过高问题

虽然效果实现了，但是 scroll 事件的触发频率非常高，每次用户一滚动就会触发，而每次触发都会执行 scroll 回调方法。

解决思路：

可以使用 `**IntersectionObserver**` 来替换监听 scroll 事件。

相比 scroll，IntersectionObserver 可以设置多个阈值来检测元素进入视口的不同程度，只在必要时才进行计算，没有性能上的浪费。并且监听回调也是异步触发的。

```javascript
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
onMounted(() => {
  // 获取可视区域高度
  screenHeight.value = listRef.value.clientHeight
  startIndex.value = 0
  endIndex.value = startIndex.value + visibleCount.value
  // 在组件挂载的时候，初始化列表项的位置信息
  initPostions()
  createObserver()
})
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
```

#### 4、完整代码

09-常见场景/vue-project/src/views/InfinityList2.vue

# 五、Vueuse

https://vueuse.org/

## 介绍

VueUse 是一个基于 Vue 组合式 API 的工具库，里面提供了一系列高效、易用的组合函数，用于简化 Vue 开发，节省开发时间。

VueUse 主要特点：

1. 丰富的组合函数
2. TS支持
3. 轻量级
4. 良好的文档

VueUse里面有很多的 [分类](https://vueuse.org/functions.html)，每个分类下面又有各种丰富的 API：

1. 浏览器 API

- useFetch：用于发起 HTTP 请求，类似于浏览器的 fetch API。
- useClipboard：用于操作剪贴板，例如复制文本。
- useLocalStorage：简化 localStorage 的使用。
- ......

1. 状态管理

- useToggle：一个简单的开关状态管理工具。
- useCounter：用于计数的状态管理工具。
- .....

1. 传感器

- useMouse：追踪鼠标的位置和状态。
- useGeolocation：获取地理位置信息。

1. 用户界面

- useFullscreen：控制元素的全屏状态。
- useDark：检测和切换暗模式。

1. 工具函数

- useDebounce：提供防抖功能。
- useThrottle：提供节流功能。

## 基本使用

安装：

```bash
npm install @vueuse/core
```

然后就可以在项目中引入并使用：

```vue
<template>
  <div>{{ x }}</div>
  <div>{{ y }}</div>
</template>
<script setup>
import { useMouse } from '@vueuse/core'

const { x, y } = useMouse()
</script>
<style scoped></style>
```



## 综合示例：待办事项

09-常见场景/vue-project/src/views/Vueuse.vue

# 六、Vuedraggable

vuedraggable 是一个基于 Sortable.js 的 Vue 组件，用于实现拖拽和排序功能。它可以让你在 Vue 应用中轻松地实现拖拽排序，并提供了丰富的配置选项和事件来控制拖拽行为。

Sortable.js 是一个轻量级的 JS 库，用于实现拖拽排序功能。它支持 HTML5 的拖拽 API，并提供了丰富的选项和事件，可以轻松地在网页中实现拖拽排序、拖拽交换等功能。Vue.Draggable 是基于 Sortable.js 构建的，用于在 Vue 应用中实现这些功能。

Sortable.js 的特点：

1. 轻量级：Sortable.js 非常轻量，核心库只有几千字节。
2. 高性能：利用现代浏览器的 HTML5 拖拽 API，提供高性能的拖拽体验。
3. 多样的选项：提供丰富的选项和回调函数，可以自定义拖拽行为。
4. 多种场景：支持多种拖拽场景，包括列表排序、网格布局、分组拖拽等。
5. 与框架集成：容易与主流前端框架集成，如 Vue、React、Angular 等。



## 基本使用

首先安装这个库：

```bash
npm install vuedraggable@4.0.0
```

注意在安装的时候，一定要指定安装的版本为 4.0.0，因为默认不会安装这个版本。

安装后可以从这个库中导入一个**组件**：

```vue
<template>
  <draggable 
     v-model="myArray" 
     group="people" 
     @start="drag=true" 
     @end="drag=false" 
     itemKey="id"
   >
    <template #item="{ element }">
      <div class="task">{{ element.name }}</div>
    </template>
  </draggable>
</template>
<script setup>
import draggable from 'vuedraggable'
</script>
```

这是 vuedraggable 的一个标准用法。

1. v-model="myArray"：数组包含了需要拖拽排序的元素。
2. group="people"：group 属性用于配置**分组**，相同 group 名称的 draggable 实例之间允许相互拖拽元素。
3. @start="drag=true"：当拖拽操作开始时触发，这里将 drag 变量设置为 true，这可以用于在拖拽开始时触发一些行为，比如改变样式或显示一些提示。
4. @end="drag=false"：当拖拽操作结束时触发，这里将 drag 变量设置为 false



## 案例

一个“未完成”列表和一个“已完成”列表，两个列表之间的项目可以自由拖动：

# 七、vue-drag-resize

vue-drag-resize：和拖拽相关的库

- vuedraggable：主要用于列表项的拖拽排序。
- vue-drag-resize：主要用于需要用户交互调整大小和位置的元素，如看板、图表、可视化编辑器等。

## 基本使用

安装这个库：

```bash
npm install vue-drag-resize
```

安装的版本信息："vue-drag-resize": "^1.5.4"

接下来从 vue-drag-resize/src 中可以导入一个**组件 VueDragResize**，该组件提供一个插槽，可以存放要 resize 的模板内容。

基本示例核心代码：

```vue
<template>
  <div id="app">
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
// 注意，这里是从vue-drag-resize下面的src目录导出的组件
import VueDragResize from 'vue-drag-resize/src'

const resizeHandle = (size) => {
  console.log('调整了元素大小')
  console.log(size)
}
</script>
```



## 场景示例

用户选择图片，并自由的对图片进行裁剪。

### 选择图片并进行预览

```vue
<template>
  <div class="crop">
    <h1>照片编辑器</h1>
    <div class="controls">
      <input type="file" accept="image/*" @change="onChange"/>
      <button>裁剪</button>
    </div>
    <div class="editor-container" v-if="imageUrl">
      <div class="image-container">
        <img :src="imageUrl" class="photo" alt="用户选择的图片">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const imageUrl = ref(null)
const onChange = (event) => {
  const file = event.target.files[0]
  const reader = new FileReader()
  // 读取文件，读取完成后会触发 onload 事件
  reader.readAsDataURL(file)
  reader.onload = async (e) => {
    imageUrl.value = e.target.result
  }
}
</script>
```

### 展示裁剪区域更新裁剪区域信息

```vue
<template>
  <div class="crop">
    <h1>照片编辑器</h1>
    <div class="controls">
      <input type="file" accept="image/*" @change="onChange"/>
      <button :disabled="!imageUrl">裁剪</button>
    </div>
    <div class="editor-container" v-if="imageUrl">
      <div class="image-container">
        <img :src="imageUrl" class="photo" alt="用户选择的图片">
        <!-- 裁剪区域 -->
        <vue-drag-resize
          v-model="cropArea"
          :key="imageUrl"
          class="crop-area"
          :resizable="true"
          :draggable="true"
          :min-width="50"
          :min-height="50"
          :parent="true"
          :parent-limitation="true"
          @resizing="onResizing"
          @dragging="onDragging"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VueDragResize from 'vue-drag-resize/src'

// 裁剪区域初始坐标尺寸
const cropArea = ref({
  x: 100,
  y: 100,
  w: 100,
  h: 100
})
const imageUrl = ref(null)


const onResizing = ({left, top, width, height}) => {
  cropArea.value = { x: left, y: top, w: width, h: height}
  console.log('111', cropArea.value)
}

const onDragging = ({left, top}) => {
  cropArea.value = {...cropArea.value, x: left, y: top}
}
</script>
```

- parent： 将裁剪区域限制在父元素内
- parent-limitation: 加入父元素边界判断，移动的时候限制在父元素内

### 图片裁剪

使用canvas将裁剪区域的图片绘制出来

```vue
<template>
  <div class="crop">
    <h1>照片编辑器</h1>
    <div class="controls">
      <input type="file" accept="image/*" @change="onChange"/>
      <button :disabled="!imageUrl" @click="handleCrop">裁剪</button>
    </div>
    <div class="editor-container" v-if="imageUrl">
      <div class="image-container">
        <img :src="imageUrl" class="photo" alt="用户选择的图片">
        <!-- 裁剪区域 -->
        <vue-drag-resize
          v-model="cropArea"
          :key="imageUrl"
          class="crop-area"
          :resizable="true"
          :draggable="true"
          :min-width="50"
          :min-height="50"
          :parent="true"
          :parent-limitation="true"
          @resizing="onResizing"
          @dragging="onDragging"
        />
      </div>
    </div>
    <div class="preview" v-if="croppedImageUrl">
      <h2>裁剪后的图片</h2>
      <!-- 显示裁剪后的图像 -->
      <img :src="croppedImageUrl" alt="裁剪后的图像" />
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import VueDragResize from 'vue-drag-resize/src'

// 裁剪区域初始坐标尺寸
const cropArea = ref({
  x: 100,
  y: 100,
  w: 100,
  h: 100
})
const imageUrl = ref(null)

const photoRef = ref(null)
const onChange = (event) => {
  const file = event.target.files[0]
  const reader = new FileReader()
  // 读取文件，读取完成后会触发 onload 事件
  reader.readAsDataURL(file)
  reader.onload = async (e) => {
    imageUrl.value = e.target.result
    await nextTick()
    photoRef.value = document.querySelector('.photo')
  }
}

const onResizing = ({left, top, width, height}) => {
  cropArea.value = { x: left, y: top, w: width, h: height}
}

const onDragging = ({left, top}) => {
  cropArea.value = {...cropArea.value, x: left, y: top}
}

const croppedImageUrl = ref(null) // 存储裁剪后的图像的 URL
const handleCrop = () => {
  const photo = photoRef.value
  if (!photo) return
  // 创建一个新的 image 对象，用于存储裁剪后的图像
  const image = new Image()
  image.src = imageUrl.value // 设置图像的 URL
  // 该事件会在图像加载完成后触发
  image.onload = () => {
    // 主要需要做的工作，是将裁剪后的图像绘制到 canvas 上
    const canvas = document.createElement('canvas') // 创建一个 canvas 元素
    const ctx = canvas.getContext('2d') // 获取 canvas 的 2d 上下文对象
    // 从裁剪区域获取信息：坐标和尺寸
    const { x, y, w, h } = cropArea.value
    // 获取原始图像的尺寸
    const imageWidth = image.width
    const imageHeight = image.height
    // 获取显示图像的容器元素
    const containerWidth = photo.clientWidth
    const containerHeight = photo.clientHeight
    // 接下来来计算两个宽高比
    // 图像的宽高比
    const imageAspectRatio = imageWidth / imageHeight
    // 容器元素的宽高比
    const containerAspectRatio = containerWidth / containerHeight
    // 计算图像在容器中显示的宽高
    let displayWidth, displayHeight
    if (imageAspectRatio > containerAspectRatio) {
      // 图像更宽
      displayWidth = containerWidth
      displayHeight = containerWidth / imageAspectRatio
    } else {
      // 图像更高
      displayHeight = containerHeight
      displayWidth = containerHeight * imageAspectRatio
    }

    // 接下来需要计算图像在容器中的一个偏移量
    const offsetX = (containerWidth - displayWidth) / 2
    const offsetY = (containerHeight - displayHeight) / 2

    // 接下来还需要计算水平和垂直缩放比例
    const scaleX = imageWidth / displayWidth
    const scaleY = imageHeight / displayHeight

    // 为什么需要这些数据呢？因为一会儿绘制canvas的时候，需要使用这些数据

    // 设置 canvas 画布的宽高
    canvas.width = w * scaleX
    canvas.height = h * scaleY

    // 数据准备完毕后，接下来调用 canvas 方法来进行绘制
    ctx.drawImage(
      image, // 绘制的图像
      (x - offsetX) * scaleX, // 裁剪区域的 x 坐标
      (y - offsetY) * scaleY, // 裁剪区域的 y 坐标
      w * scaleX, // 裁剪区域的宽度
      h * scaleY, // 裁剪区域的高度
      0, // 绘制到 canvas 的 x 坐标
      0, // 绘制到 canvas 的 y 坐标
      w * scaleX, // 绘制到 canvas 的宽度
      h * scaleY // 绘制到 canvas 的高度
    )
    croppedImageUrl.value = canvas.toDataURL('image/png') // 将 canvas 转换为 base64 编码的 URL
    console.log('croppedImageUrl', croppedImageUrl.value)
  }
}
</script>
```

# 八、vue-chartjs



vue-chartjs 是一个用于在 Vue 项目中创建图表的库，它基于 Chart.js 构建。Chart.js 是一个简单而灵活的 JS 图表库，提供了多种类型的图表。vue-chartjs 提供了与 Vue 的无缝集成，让在 Vue 应用中创建和管理图表变得更加方便。

vue-chartjs 的特性：

1. 与 Chart.js 集成
2. 响应式图表
3. 可定制性
4. 组件化

## 快速上手

首先安装这个库：

```bash
npm i vue-chartjs chart.js
```

基础示例核心代码：

```vue
<template>
  <Bar :data="data" :options="options" />
</template>
<script setup>
import { ref } from 'vue'
// 接下来需要从 chart.js 里面引入一些组件
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'

// 首先需要注册从 chart.js 引入的组件
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const data = ref({
  // 图表的X轴
  labels: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ],
  datasets: [
    {
      label: '月份销售数据',
      backgroundColor: '#f87979', // 数据集的背景颜色
      data: [40, 20, 12, 39, 10, 40, 39, 80, 40, 20, 12, 11] // 数据集的数据(Y轴)
    }
  ]
})

const options = ref({
  responsive: true // 响应式，图表会根据容器大小自动调整
})
</script>
```

核心：

1. 从 chartjs 里面引入一组组件，进行注册
2. 从 vue-chartjs 里面导入图表组件，一般需要传入的参数：data、options



## 其他细节

1. 有哪些图形

vue-chartjs 基于 Chart.js，因此支持 Chart.js 提供的所有图表类型。以下是 Chart.js 提供的图表类型，这些图表类型在 vue-chartjs 中也可以使用：

- Line Chart（折线图）
- Bar Chart（柱状图）
- Radar Chart（雷达图）
- Doughnut Chart（圆环图）
- Pie Chart（饼图）
- Polar Area Chart（极地区域图）
- Bubble Chart（气泡图）
- Scatter Chart（散点图）

### 2. 注册组件是什么意思

注册组件代码：

```javascript
ChartJS.register(ArcElement, Title, Tooltip, Legend);
```

这是因为从 Chart.js 4.x 版本**开始采用模块化设计，以减少最终构建的文件大小，并提高性能。**每个图表被分为了多个组件，为了让这些组件在图表中生效，需要在使用之前将它们注册到 Chart.js 中。

### 3. options有哪些配置项

[vue-chartjs官网](https://vue-chartjs.org/)

[Chart.js官网](https://www.chartjs.org/docs/latest/) 

### 4. 使用插件

Chart.js 配置项里面其中的一项，是配置插件：

```javascript
const config = {
  type: 'line',
  data: {},
  options: {},
  plugins: []
}
```

vue-chartjs 自然也支持插件机制。

使用插件示例：缩放插件（chartjs-plugin-zoom）用于在图表中添加缩放和平移功能。

09-常见场景/vue-project/src/views/VueCartjs.vue



# 九、Vuelidate

Vuelidate 是一个轻量级的表单验证库，专门为 Vue.js 设计，提供简单而灵活的方式来验证表单输入。它可以与 Vue2 和 Vue3 一起使用，并且支持各种常见的验证规则，例如必填字段、最小和最大长度、模式匹配等。

## 基本使用

首先安装这个库：

```bash
npm install @vuelidate/core @vuelidate/validators
```

基础使用核心代码：

```javascript
const v$ = useVuelidate(rules, state)

// 提交表单的处理函数
function submitForm() {
  v$.value.$touch()
  if (v$.value.$invalid) {
    console.log('Form is invalid')
  } else {
    console.log('Form is valid')
  }
}
```

重要的代码解释：

```javascript
// 创建一个表单验证的实例对象
const v$ = useVuelidate(rules, state)
```

这行代码调用 useVuelidate 函数，将**验证规则 rules** 和**验证状态 state** 作为参数传入，并将返回的验证对象赋值给 v$ 变量。

v$ 是一个代理对象，包含了所有表单字段的验证状态，另外还有一系列的属性和方法，用于检查和操作验证状态。

```javascript
// 触发验证
v$.value.$touch()
```

$touch( ) 方法用于标记所有验证规则为 “已触摸” 状态。这个方法通常在提交表单时调用，以**触发所有字段的验证**。

```javascript
v$.value.$invalid
```

$invalid表示整个表单是否无效。如果**表单中有任何一个字段不符合验证规则，$invalid 属性将为 true**。



## 有哪些规则？

1. required: 字段必须填写。
2. minLength: 字段值的最小长度。
3. maxLength: 字段值的最大长度。
4. minValue: 字段值的最小数值。
5. maxValue: 字段值的最大数值。
6. between: 字段值必须在指定的数值范围内。
7. alpha: 字段值只能包含字母。
8. alphaNum: 字段值只能包含字母和数字。
9. numeric: 字段值必须是数字。
10. integer: 字段值必须是整数。
11. decimal: 字段值必须是小数。
12. email: 字段值必须是有效的电子邮件地址。
13. ipAddress: 字段值必须是有效的 IP 地址。
14. macAddress: 字段值必须是有效的 MAC 地址。
15. url: 字段值必须是有效的 URL 地址。
16. sameAs: 字段值必须与另一个字段的值相同。
17. or: 多个验证规则中至少一个为 true。
18. and: 多个验证规则必须都为 true。
19. not: 验证规则必须为 false。
20. requiredIf: 字段必须在某个条件为 true 时填写。
21. requiredUnless: 字段必须在某个条件为 false 时填写。

你可以在 [Vuelidate官方文档](https://vuelidate-next.netlify.app/validators.html) 看到每一条规则的说明。



## 实战案例

用户注册的实战案例，在这个案例里面，尽可能多的用到 Vuelidate 里面的验证规则，并且**显示自定义中文提示**。

09-常见场景/vue-project/src/views/Vuelidate2.vue

## 其他细节

### 1. 使用正则

在 Vuelidate 里面可以通过 helpers.regex 来创建一个自定义的正则验证器。

```javascript
const phoneNumberWithMessage = helpers.withMessage(
  '必须是一个有效的电话号码',
  helpers.regex(/^1[3-9]\d{9}$/)
)

const rules = {
  phoneNumber: {
    required: requiredWithMessage,
    numeric: numericWithMessage,
    phoneNumber: phoneNumberWithMessage
  },
}
```

### 2. 自定义验证规则

通过 helpers 可以自定义验证规则。



更多进阶用法可以参阅官方文档：https://vuelidate-next.netlify.app/advanced_usage.html

# 十、vue3-lazyload

vue3-lazyload 是一个用于 Vue3 应用的**图片懒加载库**，它允许在图片进入视口之前不加载图片，从而提升页面的加载速度和性能。

vue3-lazyload 主要特点有：

1. 轻量级
2. 简单易用
3. 支持占位图
4. 支持自定义加载和错误处理

图片懒加载原理：在页面首次加载的时候，只有视口里面的图片才会被加载，其他图片需要用户滚动到视口时才会加载（src先设置成占位图地址，将真实图片路径放在data-src中，当图片需要展示出来时再把src设置成真实地址）。

思考1🤔：前面介绍过虚拟列表，长列表都可以使用虚拟列表来处理，懒加载是不是已经被淘汰了？

1. 懒加载

- 适用场景：图片较多但数量不至于太多的列表，通常是几十到几百项。
- 工作原理：延迟加载进入视口的图片或资源，在用户滚动到接近这些资源时再进行加载。
- 优点：减小初始页面加载时间，减少带宽消耗。
- 缺点：在数量非常多时（如数万或十万项），DOM 节点的数量会变得非常庞大，导致浏览器渲染性能下降。

1. 虚拟列表

- 适用场景：非常长的列表，通常是数千到数十万项。
- 工作原理：只渲染视口内的部分 DOM 节点，动态复用这些 DOM 节点来展示不同的数据项。
- 优点：极大地减少了 DOM 节点的数量，提高渲染性能和内存使用效率。
- 缺点：实现较为复杂，尤其是需要处理动态高度项和滚动同步的问题。

思考2🤔：前面使用vue3-observe-visibility这个库来实现懒加载，这个vue3-lazyload相比那个库的优点是什么？

- vue3-observe-visibility：侧重于观察元素是否进入指定的根元素，至于进入/离开指定根元素后要做什么事情由用户自己来指定
- vue3-lazyload：专门为**图片懒加载**而生的。

## 基本使用

首先安装这个库：

```bash
npm i vue3-lazyload
```

然后在入口文件main.js中配置 vue3-lazyload：

```javascript
import { createApp } from 'vue';
import App from './App.vue';
// 引入这个库
import VueLazyload from 'vue3-lazyload';

const app = createApp(App);

// 注册这个库
app.use(VueLazyload, {
  loading: 'https://dummyimage.com/600x400/cccccc/000000&text=Loading', // 图片加载时显示的占位图片
  error: 'https://dummyimage.com/600x400/ff0000/ffffff&text=Error', // 图片加载失败时显示的图片
  // 和IntersectionObserver相关的配置选项
  observerOptions: {
    rootMargin: '0px',
    threshold: 0.1,
  },
  log: true, // 是否打印调试信息
  logLevel: 'error', // 日志级别
  delay: 0, // 设置延迟加载的时间
});

app.mount('#app');
```

配置选项说明如下：

- loading：图片加载时显示的占位图片
- error：图片加载失败时显示的图片
- observerOptions：IntersectionObserver 的配置选项
- log：是否打印调试信息
- logLevel：日志级别
- delay：设置延迟加载时间

之后在组件中使用 v-lazy 指令：

```vue
<template>
    <!-- 使用v-lazy这个指令，指令对应的值为图片的src -->
  <img v-lazy="'path/to/your/image.jpg'" alt="description">
</template>
```

指令对应的值也可以是一个对象，在对象中可以指定 loading 和 error 图片

```vue
<template>
  <img v-lazy="{ src: 'your image url', loading: 'your loading image url', error: 'your error image url' }">
</template>
```

## 案例

09-常见场景/vue-project/src/views/VueLazyload.vue

## 其他细节

### 1. 生命周期

提供 3 个钩子方法：loading、error 以及 loaded.

```javascript
app.use(VueLazyLoad, {
  loading: '',
  error: '',
  lifecycle: {
    loading: (el) => {
      console.log('loading', el)
    },
    error: (el) => {
      console.log('error', el)
    },
    loaded: (el) => {
      console.log('loaded', el)
    }
  }
})
```

### 2. observerOptions配置

observerOptions 用于配置 IntersectionObserver，通过配置 observerOptions，可以精确控制懒加载的触发时机和行为。

该配置项对应的值是一个对象：

- rootMargin

- 类型：string
- 默认值：'0px'
- 作用：用于扩展或缩小根元素的边界。类似于 CSS 的 margin 属性，可以设置四个方向的值，如 10px 20px 30px 40px。该属性可以让你提前或延后触发懒加载。例如，设置为 '100px'，表示在元素距离视口100像素时就触发加载。

- threshold

- 类型：number
- 默认值：0.1
- 作用：用于指定一个或多个阈值，当目标元素的可见比例达到这些阈值时触发回调。阈值可以是从 0 到 1 之间的数值，0 表示元素刚出现时就触发，1 表示元素完全可见时才触发。

### 3. 局部注册方式

前面注册方式为 **全局注册**，另一种是 **局部注册**，通过 **useLazyload** 在单个组件中注册，从而局部使用懒加载功能。

```vue
<template>
  <img ref="lazyRef" class="image" width="100" />
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useLazyload } from 'vue3-lazyload';

// 图片 URL
const src = ref('https://via.placeholder.com/600x400?text=Logo');

// 在该组件中，通过useLazyload来创建懒加载链接
// 注意：参数第一项是图片真实的src
const lazyRef = useLazyload(src, {
  lifecycle: {
    loading: () => {
      console.log('loading');
    },
    error: () => {
      console.log('error');
    },
    loaded: () => {
      console.log('loaded');
    },
  },
});
</script>
<style scoped>
.image {
  display: block;
  margin: 10px;
  width: 200px;
  height: 150px;
  object-fit: cover;
}
</style>
```



### 4. 控制加载样式

可以精确的控制图片不同加载状态的样式，vue3-lazyload 提供了 3 个状态：

- loading：图片正在加载中
- loaded：图片加载完成
- error：图片加载失败

在图片元素上，这些状态会通过 lazy 属性来表示。可以利用这个属性，在 CSS 中定义不同状态下图片的样式。

使用指令的时候不需要手动在图片上增加状态，这个状态是指令自动增加上的，只需要书写对应样式即可。

```vue
<img src="..." lazy="loading">
<img src="..." lazy="loaded">
<img src="..." lazy="error">

<style>
  img[lazy=loading] {
    /*your style here*/
  }
  img[lazy=error] {
    /*your style here*/
  }
  img[lazy=loaded] {
    /*your style here*/
  }
</style>
```
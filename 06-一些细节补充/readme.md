# 一、属性透传

属性透传，指的是一些没有被组件声明为 props、emits 或自定义事件的属性，但依然能传递给子组件，例如常见的 class、style 和 id. 

## 示例

A.vue

```vue
<template>
  <div>
      <p>A组件</p>
  </div>
</template>
```

App.vue

```vue
<template>
    <!-- 这些属性在A组件内部都没有声明为Props -->
  <A id="a" class="aa" data-test="test" abc="abc"/>
</template>
<script setup>
import A from './components/A.vue'
</script>
```

观察渲染结构：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739503948533-f2725776-326b-48db-aee7-1180ad614207.png)

可见，这些属性都会挂在A组件的根节点上。

## 相关细节

### 1. 对 class 和 style 的合并

如果一个子组件的根元素已经有了 class 或 style attribute，它会和从父组件上继承的值**合并**。

子组件其他同名的属性，**会被忽略**，应用父组件上继承的值。

App.vue

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739507548592-82dfc1e1-0cb7-4a47-b1bf-de8fd2b47f51.png)

A.vue

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739507562900-d24da2ad-84b2-4abd-9906-cf6f673a0f29.png)

可以发现最终渲染出来的结构中，id使用的依旧是父组件透传的属性值，而class、style进行了合并。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739507593858-d80dcd6a-a48e-496e-9b59-adbee6fd668c.png)

### 2. 深层组件继承

1. 有些情况下，一个组件会在根节点上直接去渲染另一个组件，这种情况属性会**继续透传**。

App.vue

App.vue中引入A组件

```vue
<template>
  <A id="a" class="aa" data-test="test" abc="abc" style="color: white"/>
</template>

<script setup>
import A from './components/A.vue'
</script>

<style lang="scss" scoped>

</style>
```

A.vue

A.vue中直接在根节点上渲染B组件

```vue
<template>
  <B />
</template>

<script setup>
import B from './B.vue'
</script>

<style lang="scss" scoped>

</style>
```

B.vue

```vue
<template>
  <div>
    <p>B组件</p>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>

</style>
```

可以发现最终渲染的结构为：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739507874703-1ca24786-a142-41e2-8ded-080ed6038b63.png)

可以发现在App.vue中使用A组件时传递的属性现在全部都透传到了B组件的根节点上。

1. 深层透传的属性不包含 A 组件上声明过的 props 或是针对 emits 声明事件的 v-on 侦听函数，可以理解为这些属性在 A 组件上消费了。

比如现在在A组件中去使用defineProps定义了id与style属性，那么此时id与style便不会继续透传了：

```vue
<template>
  <B />
</template>

<script setup>
import B from './B.vue'
defineProps(['id', 'style'])
</script>

<style lang="scss" scoped>

</style>
```

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739508087484-c4bf91a2-ce4f-4cf1-bafc-82a50006d55f.png)

### 3. 禁用属性透传

属性会自动透传到根元素上，但有时我们想要控制透传属性的位置，此时可以这么做：

1. 禁用透传

```javascript
defineOptions({
  inheritAttrs: false
})
```

1. 通过 v-bind 绑定 $attrs 手动指定位置

```html
<div>
  <p v-bind="$attrs">A组件</p>
</div>
<template>
  <!-- <B /> -->
  <div>
    <p v-bind="$attrs">A组件</p>
  </div>
</template>

<script setup>
import B from './B.vue'
defineOptions({
  inheritAttrs: false
})
</script>

<style lang="scss" scoped>

</style>
```

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739508187163-522e807e-b81b-4d27-9a4b-df79b8d2a992.png)

另外有两个注意点：

1. 和 props 不同，透传 attributes 在 JS 中**保留原始大小写**，所以像 foo-bar 这样的 attribute 需要通过 `$attrs['foo-bar']` 来访问。
2. 像 @click 这样的一个 v-on 事件监听器将在此对象下被暴露为一个函数 $attrs.onClick。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739513080339-218bd56f-552b-4b92-adb1-78038e3f3caa.png)

### 4. 多根节点属性透传

和单根节点组件有所不同，有着多个根节点的组件没有自动 attribute 透传行为。

```vue
<header>...</header>
<main>...</main>
<footer>...</footer>
```

这种情况下 Vue 不知道要将 attribute 透传到哪里，所以会抛出一个警告。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739513150523-548d878e-7418-43a3-a5c7-3ccf94a1d891.png)

此时需要通过 $attrs 显式绑定。

```vue
<header>...</header>
<main v-bind="$attrs">...</main>
<footer>...</footer>
```

### 5. JS中访问透传的属性

如果需要，你可以在 <script setup> 中使用 useAttrs API 来访问一个组件的所有透传 attribute：

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()
</script>
```

如果没有使用 <script setup>，attrs 会作为 setup 方法上下文对象的一个属性暴露：

```javascript
export default {
  setup(props, ctx) {
    // 透传 attribute 被暴露为 ctx.attrs
    console.log(ctx.attrs)
  }
}
```

# 二、依赖注入

Props 逐级传递存在的问题：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739515849572-16eed864-eadb-4479-bf06-476bc513dbf6.png)

使用 Pinia 能够解决该问题，但是如果不用 Pinia 呢？

可以用依赖注入。

## 快速上手

整个依赖注入分为两个角色：

1. 提供方：负责**提供数据**
2. 注入方：负责**接收数据**

**1. 提供方**

要提供数据，可以使用 provide 方法。例如：

```vue
<script setup>
  import { provide } from 'vue'

  provide(/* 数据名称 */ 'message', /* 实际数据 */ 'hello!')
  provide('message', 'hello!')
</script>
```

该方法接收的参数也很简单：

1. 数据对应的名称
2. 实际的数据

**2. 注入方**

注入方通过 inject 方法来取得数据。例如：

```vue
<script setup>
  import { inject } from 'vue'

  const message = inject('message')
</script>
```

## 相关细节

### **1. 非 setup 语法糖**

如果没有使用 setup 语法糖，那么需要**保证 provide 和 inject 方法是在 setup 方法中同步调用的**：

```vue
import { provide } from 'vue'

  export default {
    setup() {
      provide(/* 注入名 */ 'message', /* 值 */ 'hello!')
    }
  }
import { inject } from 'vue'

  export default {
    setup() {
      const message = inject('message')
      return { message }
    }
  }
```

因为 Vue 的依赖注入机制需要在组件初始化期间同步建立依赖关系，这样可以**确保所有组件在渲染之前就已经获取到必要的依赖数据**。如果 provide 和 inject 在 setup 之外或异步调用，Vue 无法保证组件初始化完成之前所有的依赖关系已经正确建立。

### **2. 全局依赖提供**

```javascript
// main.js
import { createApp } from 'vue'

const app = createApp({})

app.provide(/* 注入名 */ 'message', /* 值 */ 'hello!')
```

在应用级别提供的数据在该应用内的所有组件中都可以注入。

### **3. 注入默认值**

注入方可以提供一个默认值，这一点类似于 props 的默认值。

```javascript
// 如果没有祖先组件提供 "message"
// value 会是 "这是默认值"
const value = inject('message', '这是默认值')
```

### **4. 提供响应式数据**

提供方所提供的值**可以是任意类型的值**，**包括响应式的值**。

注意点：

1. 如果提供的值是一个 ref，注入进来的会是该 ref 对象，而**不会自动解包**为其内部的值。
2. **尽可能将任何对响应式状态的变更都保持在提供方组件中**

```vue
<!-- 在供给方组件内 -->
<script setup>
  import { provide, ref } from 'vue'

  // 响应式数据
  const location = ref('North Pole')
  // 修改响应式数据的方法
  function updateLocation() {
    location.value = 'South Pole'
  }

  provide('location', {
    location,
    updateLocation
  })
</script>
<!-- 在注入方组件 -->
<script setup>
  import { inject } from 'vue'
  // 同时拿到响应式数据，以及修改该数据的方法
  const { location, updateLocation } = inject('location')
</script>

<template>
  <button @click="updateLocation">{{ location }}</button>
</template>
```

1. 使用 readonly 来提供只读值

```vue
<script setup>
  import { ref, provide, readonly } from 'vue'

  const count = ref(0)
  provide('read-only-count', readonly(count))
</script>
```

### **5. 使用Symbol作为数据名**

大型的应用建议最好使用 Symbol 来作为注入名以避免潜在的冲突。推荐在一个单独的文件中导出这些注入名 Symbol：

```javascript
// keys.js
export const myInjectionKey = Symbol()
// 在供给方组件中
import { provide } from 'vue'
import { myInjectionKey } from './keys.js'

provide(myInjectionKey, { /* 要提供的数据 */ });
// 注入方组件
import { inject } from 'vue'
import { myInjectionKey } from './keys.js'

const injected = inject(myInjectionKey)
```

实战案例：整个应用程序在多个组件中共享一些全局配置（主题颜色、用户信息...）



# 三、组合式函数

组合式函数，本质上也就是**代码复用**的一种方式。

- 组件：对结构、样式、逻辑进行复用
- 组合式函数：侧重于对 **有状态** 的逻辑进行复用



## 快速上手

实现一个鼠标坐标值的追踪器。

```vue
<template>
  <div>当前鼠标位置: {{ x }}, {{ y }}</div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const x = ref(0)
const y = ref(0)

function update(event) {
  x.value = event.pageX
  y.value = event.pageY
}

onMounted(() => window.addEventListener('mousemove', update))
onUnmounted(() => window.removeEventListener('mousemove', update))
</script>
<style scoped></style>
```

多个组件中**复用这个相同的逻辑**，该怎么办？

答：使用组合式函数。将包含了状态的相关逻辑，一起提取到一个单独的函数中，该函数就是组合式函数。

hooks/useMouse.js

```javascript
import { ref, onMounted, onUnmounted } from 'vue'
export function useMouse() {

  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))
  
  return {x, y}
}
```

App.vue

```vue
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
```



## 相关细节

### 1. 组合式函数本身还可以相互嵌套

hooks/useEvent.js

```javascript
import { onMounted, onUnmounted } from "vue"

export function useEvent(target, event, cb) {
  onMounted(() => target.addEventListener(event, cb))
  onUnmounted(() => target.removeEventListener(event, cb))
}
```

hooks/useMouse.js

```javascript
import { ref } from 'vue'
import { useEvent } from './useEvent'
export function useMouse() {

  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  useEvent(window, 'mousemove', update)
  
  return {x, y}
}
```

### 2. 和Vue2时期mixin区别

解决了 Vue2 时期 mixin 的一些问题。

1. **不清晰的数据来源**：当使用多个 minxin 的时候，实例上的数据属性来自于哪一个 mixin 不太好分辨。
2. **命名空间冲突**：如果多个 mixin 来自于不同的作者，可能会注册相同的属性名，造成命名冲突mixin

```javascript
const mixinA = {
  methods: {
    fetchData() {
      // fetch data logic for mixin A
      console.log('Fetching data from mixin A');
    }
  }
};

const mixinB = {
  methods: {
    fetchData() {
      // fetch data logic for mixin B
      console.log('Fetching data from mixin B');
    }
  }
};

new Vue({
  mixins: [mixinA, mixinB],
  template: `
    <div>
      <button @click="fetchData">Fetch Data</button>
    </div>
  `
});
```

组合式函数：

```javascript
// useMixinA.js
import { ref } from 'vue';

export function useMixinA() {
  function fetchData() {
    // fetch data logic for mixin A
    console.log('Fetching data from mixin A');
  }

  return { fetchData };
}

// useMixinB.js
import { ref } from 'vue';

export function useMixinB() {
  function fetchData() {
    // fetch data logic for mixin B
    console.log('Fetching data from mixin B');
  }

  return { fetchData };
}
```

组件使用上面的组合式函数：

```javascript
import { defineComponent } from 'vue';
import { useMixinA } from './useMixinA';
import { useMixinB } from './useMixinB';

export default defineComponent({
  setup() {
    // 这里必须要给别名
    const { fetchData: fetchDataA } = useMixinA();
    const { fetchData: fetchDataB } = useMixinB();

    fetchDataA();
    fetchDataB();

    return { fetchDataA, fetchDataB };
  },
  template: `
    <div>
      <button @click="fetchDataA">Fetch Data A</button>
      <button @click="fetchDataB">Fetch Data B</button>
    </div>
  `
});
```

1. 隐式的跨mixin交流mixin

```javascript
export const mixinA = {
  data() {
    return {
      sharedValue: 'some value'
    };
  }
};
export const minxinB = {
  computed: {
    dValue(){
      // 和 mixinA 具有隐式的交流
      // 因为最终 mixin 的内容会被合并到组件实例上面，因此在 mixinB 里面可以直接访问 mixinA 的数据
      return this.sharedValue + 'xxxx';
    }
  }
}
```

组合式函数：交流就是显式的

```javascript
import { ref } from 'vue';

export function useMixinA() {
  const sharedValue = ref('some value');
  return { sharedValue };
}
```

此时如果useMixinB中想使用sharedValue就得以参数的形式传递进来：

```javascript
import { computed } from 'vue';

export function useMixinB(sharedValue) {
  const derivedValue = computed(() => sharedValue.value + ' extended');
  return { derivedValue };
}
<template>
  <div>
    {{ derivedValue }}
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useMixinA } from './useMixinA';
import { useMixinB } from './useMixinB';

export default defineComponent({
  setup() {
    const { sharedValue } = useMixinA();
    
    // 两个组合式函数的交流是显式的
    const { derivedValue } = useMixinB(sharedValue);

    return { derivedValue };
  }
});
</script>
```



### 3.异步状态

根据异步请求的情况显示不同的信息：

```vue
<template>
  <div v-if="error">Oops! Error encountered: {{ error.message }}</div>
  <div v-else-if="data">
    Data loaded:
    <pre>{{ data }}</pre>
  </div>
  <div v-else>Loading...</div>
</template>
<script setup>
import { ref } from 'vue'

// 发送请求获取数据
const data = ref(null)
// 错误
const error = ref(null)

fetch('...')
  .then((res) => res.json())
  .then((json) => (data.value = json))
  .catch((err) => (error.value = err))
</script>
```

如何复用这段逻辑？仍然是提取成一个组合式函数。

如下：

```javascript
import { ref } from 'vue'
export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)

  fetch(url)
    .then((res) => res.json())
    .then((json) => (data.value = json))
    .catch((err) => (error.value = err))

  return { data, error }
}
```

现在重构上面的组件：

```vue
<template>
  <div v-if="error">Oops! Error encountered: {{ error.message }}</div>
  <div v-else-if="data">
    Data loaded:
    <pre>{{ data }}</pre>
  </div>
  <div v-else>Loading...</div>
</template>
<script setup>
import {useFetch} from './hooks/useFetch';
const {data, error} = useFetch('xxxx')
</script>
```



这里为了更加灵活，我们想要传递一个响应式数据：

```javascript
const url = ref('first-url');
// 请求数据
const {data, error} = useFetch(url);
// 修改 url 的值后重新请求数据
url.value = 'new-url';
```

此时我们就需要重构上面的组合式函数：

```javascript
import { ref, watchEffect, toValue } from 'vue'
export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)

  const fetchData = () => {
    // 每次执行 fetchData 的时候，重制 data 和 error 的值
    data.value = null
    error.value = null

    fetch(toValue(url))
      .then((res) => res.json())
      .then((json) => (data.value = json))
      .catch((err) => (error.value = err))
  }

  watchEffect(() => {
    fetchData()
  })

  return { data, error }
}
```

toValue: 如果传递的是一个普通数据直接返回，如果是一个响应式数据返回.value



**约定和最佳实践**

**1. 命名**：组合式函数约定用**驼峰命名法**命名，并**以“use”作为开头**。例如前面的 useMouse、useEvent.

**2. 输入参数**：注意参数是**响应式数据**的情况。如果你的组合式函数在输入参数是 ref 或 getter 的情况下创建了响应式 effect，为了让它能够被正确追踪，请确保要么使用 watch( ) 显式地监视 ref 或 getter，要么在 watchEffect( ) 中调用 toValue( )。

**3. 返回值**

组合式函数中推荐返回一个普通对象，该对象的每一项是 ref 数据，这样可以保证在解构的时候仍然能够保持其响应式的特性：

```javascript
// 组合式函数
export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  // ...
  
  return { x, y }
}
import { useMouse } from './hooks/useMouse'
// 可以解构
const { x, y } = useMouse()
```

如果希望以对象属性的形式来使用组合式函数中返回的状态，可以将返回的对象用 reactive 再包装一次即可：

```javascript
import { useMouse } from './hooks/useMouse'
const mouse = reactive(useMouse())
```

**4. 副作用**

在组合式函数中可以执行副作用，例如添加 DOM 事件监听器或者请求数据。但是请确保在 onUnmounted 里面清理副作用。

例如在一个组合式函数设置了一个事件监听器，那么就需要在 onUnmounted 的时候移除这个事件监听器。

```javascript
export function useMouse() {
  // ...

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

    // ...
}
```

也可以像前面 useEvent 一样，专门定义一个组合式函数来处理副作用：

```javascript
import { onMounted, onUnmounted } from 'vue'

export function useEventListener(target, event, callback) {
  // 专门处理副作用的组合式函数
  onMounted(() => target.addEventListener(event, callback))
  onUnmounted(() => target.removeEventListener(event, callback))
}
```

**5. 使用限制**

1. 只能在 <script setup>或 setup( ) 钩子中调用：确保在组件实例被创建时，所有的组合式函数都被正确初始化。特别如果你使用的是选项式 API，那么需要在 setup 方法中调用组合式函数，并且返回，这样才能暴露给 this 及其模板使用

```javascript
import { useMouse } from './mouse.js'
import { useFetch } from './fetch.js'

export default {
  setup() {
    // 因为组合式函数会返回一些状态
    // 为了后面通过 this 能够正确访问到这些数据状态
    // 必须在 setup 的时候调用组合式函数
    const { x, y } = useMouse()
    const { data, error } = useFetch('...')
    return { x, y, data, error }
  },
  mounted() {
    // setup() 暴露的属性可以在通过 `this` 访问到
    console.log(this.x)
  }
  // ...其他选项
}
```

1. 只能被同步调用：组合式函数需要同步调用，以确保在组件实例的初始化过程中，所有相关的状态和副作用都能被正确地设置和处理。如果组合式函数被异步调用，可能会导致在组件实例还未完全初始化时，尝试访问未定义的实例数据，从而引发错误。
2. 可以在像 onMounted 生命周期钩子中调用：在某些情况下，可以在如 onMounted 生命周期钩子中调用组合式函数。这些生命周期钩子也是**同步执行**的，并且在组件实例已经被初始化后调用，因此可以安全地使用组合式函数。

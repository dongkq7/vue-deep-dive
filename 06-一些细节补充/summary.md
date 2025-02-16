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



# 四、自定义指令

Vue内置指令：

- v-if
- v-for
- v-show
- v-html
- v-model
- v-on
- v-bind
- ....

自定义指令的本质也是一种复用。

目前为止复用的方式有：

- 组件: 对结构、样式、逻辑的一种复用
- 组合式函数：侧重于对**有状态的逻辑**进行复用
- 自定义指令：重用涉及普通元素的底层 DOM 访问的逻辑

## 快速上手

App.vue

```vue
<template>
  <input type="text" v-focus />
</template>
<script setup>
// 这里是局部注册自定义指令，只在 App.vue里面生效
const vFocus = {
  // 键值对
  // 键：生命周期钩子 值：函数
  mounted: (el) => {
    // 这个是 DOM 原生方法，用来让元素获取焦点
    el.focus()
  }
}
</script>
<style scoped></style>
```

指令名称要以`v`开头

## 相关细节

### 1. 不同组件写法下的自定义指令

1. Vue3 setup 语法setup 写法中**任何以 v 开头的驼峰式命名的变量**都可以被用作一个自定义指令。
2. 非 setup 语法：**需要在 directives 中进行注册**，例如：App.vue

```vue
<script>
export default {
  // 有一个directives的配置选项
  directives: {
    focus: {
      mounted: (el) => el.focus()
    }
  }
}
</script>

<template>
  <input v-focus />
</template>
```

### 2. 全局注册

在 app 应用实例上面通过 directive 来进行注册。

main.js

```javascript
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

// 创建一个全局的自定义指令 v-focus
// 全局注册的自定义指令可以在所有组件里面使用
app.directive('focus', {
  mounted(el) {
    el.focus();
  }
});

app.mount('#app');
```

简化写法：

```javascript
// 注意第二个参数，不再是对象而是函数
app.directive('color', (el, binding) => {
  // 这会在 `mounted` 和 `updated` 时都调用
  el.style.color = binding.value
})
```

第二个参数是一个函数而非对象，之前对象可以指定具体哪个生命周期，而**函数对应的就固定是 mounted 和 updated 生命周期**。

### 3. 指令钩子

对象内是和生命周期钩子相关的键值对，可以选择其他生命周期钩子函数：

```javascript
const myDirective = {
  // 在绑定元素的 attribute 前
  // 或事件监听器应用前调用
  created(el, binding, vnode) {
    // 下面会介绍各个参数的细节
  },
  // 在元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode) {},
  // 在绑定元素的父组件
  // 及他自己的所有子节点都挂载完成后调用
  mounted(el, binding, vnode) {},
  // 绑定元素的父组件更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {},
  // 在绑定元素的父组件
  // 及他自己的所有子节点都更新后调用
  updated(el, binding, vnode, prevVnode) {},
  // 绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode) {},
  // 绑定元素的父组件卸载后调用
  unmounted(el, binding, vnode) {}
}
```

指令的钩子函数，会有这么一些参数：

1. el：**指令绑定到的元素**。这可以用于直接操作 DOM。
2. binding：这是一个**对象**

例如：

```vue
<div v-example:foo.bar="baz">
```

binding 参数如下：

```javascript
{
  arg: 'foo',
  modifiers: { bar: true },
  value: /* baz 的值 */,
  oldValue: /* 上一次更新时 baz 的值 */
}
```

换句话说，通过 binding 对象，可以获取到用户在使用指令时的一些 **详细** 信息，回头需要根据这些详细信息做不同处理。

再来看一个前面学过的内置指令：

```vue
<div v-bind:id="id">
```

binding 参数如下：

```javascript
{
  arg: 'id',
  value: /* id 的值 */,
  oldValue: /* 上一次更新时 id 的值 */
}
```

- **value**：传递给指令的值。例如在 v-my-directive="1 + 1" 中，值是 2。 
- **oldValue**：之前的值，仅在 beforeUpdate 和 updated 中可用。无论值是否更改，它都可用。 
- **arg**：传递给指令的**参数** (如果有的话)。例如在 v-my-directive:foo 中，参数是 "foo"。 
- **modifiers**：一个包含**修饰符的对象**。例如在 v-my-directive.foo.bar 中，修饰符对象是 { foo: true, bar: true }。 
- **instance**：使用该指令的**组件实例**。 
- **dir**：指令的定义对象。

1. **vnode**：代表绑定元素的底层 VNode。
2. **preVnode**：代表之前的渲染中指令所绑定元素的 VNode。仅在 beforeUpdate 和 updated 钩子中可用。

### 4. 传递多个值

正常情况下，会给指令传递一个值，例如：

```vue
<div v-bind:id="id">
```

这里给指令传递的值就是 id.

但是有些时候的需求是传递多个值，这个时候可以使用**对象字面量**，例如：

```vue
<div v-demo="{ color: 'white', text: 'hello!' }"></div>
```

这里就通过对象的方式传递了多个值：

```javascript
app.directive('demo', (el, binding) => {
  // binding.value 
  console.log(binding.value.color) // => "white"
  console.log(binding.value.text) // => "hello!"
})
```

## 案例

1. 创建一个自定义指令 v-permission，用于控制 DOM 元素根据用户权限列表来显示

2. 创建一个自定义指令 v-time，用于显示相对时间，例如 XX秒前、XX分前、XX小时前、20XX-XX-XX

   

# 五、自定义插件

插件（plugin）是一种可选的独立模块，它可以添加特定功能或特性，而无需修改主程序的代码。

每个需求功能都不一样，框架是无法预知的。

所以干脆提供一种机制，自己去写某些逻辑，然后加入到框架中即可。

这种机制就是插件。

## 插件的使用与制作

Vue中使用插件：

```javascript
const app = createApp();
// 通过use方法来使用插件
app.use(router).use(pinia).use(ElementPlus).mount('#app')
```

Vue中制作插件：

1. 一个插件可以是一个**拥有 install 方法的对象**：

```javascript
const myPlugin = {
  install(app, options) {
    // 配置此应用
  }
}
```

1. 也可以直接是**一个安装函数本身**：

```javascript
const install = function(app, options){}
```

安装方法接收两个参数：

1. app：应用实例
2. options：额外选项，**这是在使用插件时传入的额外信息**

```javascript
app.use(myPlugin, {
  /* 可选的选项，会传递给 options */
})
```

Vue中插件带来的增强包括：

1. 通过 `app.component` 和 `app.directive` 注册一到多个全局组件或自定义指令
2. 通过 `app.provide` 使一个资源注入进整个应用
3. 向 a`pp.config.globalProperties `中添加一些全局实例属性或方法
4. 一个可能上述三种都包含了的功能库 (例如 vue-router)

例如：自定义组件库时，install 方法所做的事情就是往当前应用注册所有的组件：

```javascript
import Button from './Button.vue';
import Card from './Card.vue';
import Alert from './Alert.vue';

const components = [Button, Card, Alert];

const myPlugin = {
  install(app, options){
    // 这里要做的事情，其实就是引入所有的自定义组件
    // 然后将其注册到当前的应用里面
    components.forEach(com=>{
      app.component(com.name, com);
    })
  }
}

export default myPlugin;
```



## 案例

在企业级应用开发中，经常需要一个 **全局错误处理和日志记录插件**，它能够帮助捕获和记录全局的错误信息，并提供一个集中化的日志记录机制。

我们的插件目标如下：

1. **捕获全局的 Vue 错误**和**未处理的 Promise 错误**。
2. 将错误信息**记录到控制台**或**发送到远程日志服务器**。
3. 提供一个 Vue 组件用于显示最近的错误日志。

# 六、Transition

Transition 是 Vue 提供的一个内置组件，作用：会在一个元素或组件**进入**和**离开** DOM 时应用动画。

在 Web 应用中，有一个很常见的需求，就是针对元素的进入或者离开应用动画。

不用 Transition 组件行不行？

当然可以。

## 基本使用方式

1. 不用 Transition 代码示例

```vue
<template>
  <div>
    <button @click="show = !show">切换</button>
    <div :class="['fade', { active: show, leave: !show }]">
      <h1>动画</h1>
      <p>淡入淡出</p>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  const show = ref(true)
</script>

<style scoped>
  .fade {
    transition: 1s;
  }

  .active {
    opacity: 1;
  }

  .leave {
    opacity: 0;
  }
</style>
```

1. 使用 Transition 代码示例

```vue
<template>
  <div>
    <button @click="show = !show">切换</button>
    <div :class="['fade', { active: show, leave: !show }]">
      <h1>动画</h1>
      <p>淡入淡出</p>
    </div>
    <Transition>
      <div v-if="show">
        <h1>动画</h1>
        <p>淡入淡出</p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  const show = ref(true)
</script>

<style scoped>
  .fade {
    transition: 1s;
  }

  .active {
    opacity: 1;
  }

  .leave {
    opacity: 0;
  }

  .v-enter-active,
  .v-leave-active {
    transition: opacity 1s;
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  }

  .v-enter-to,
  .v-leave-from {
    opacity: 1;
  }
</style>
```

【注意】由于Transition是在元素或组件进入或离开时应用动画，所以在使用transition时，需要在div上加上`v-if="show"`

思考🤔：使用 Transition 带来的好处是什么？

使用 Transition，它会自动的控制一组特定样式类的挂载和移除，这样的话模板就会清爽很多。但是对应的样式类还是要自己来写，因为 Vue无法预知你要如何进入和离开，它只负责在特定时间挂载和移除样式类。

Transition 样式类有 6 个，分别对应两大阶段：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739615048441-b7257f50-a14c-4da7-8ccb-4aebbd259ee7.png)

1. 进入

- v-enter-from
- v-enter-to
- v-enter-active

1. 离开

- v-leave-from
- v-leave-to
- v-leave-active

以进入为例，Vue 会在元素**插入之前**，自动的挂上 v-enter-from 以及 v-enter-active 类，类似于：（所以在控制台中是看不到v-enter-from的，因为是插入到DOM之前才会有的）

```html
<div v-if="show" class="v-enter-from v-enter-active">
  <h1>动画</h1>
  <p>淡入淡出</p>
</div>
```

**元素插入完成后**，会移除 v-enter-from 样式类，然后插入 v-enter-to，类似于：

```html
<div v-if="show" class="v-enter-to v-enter-active">
  <h1>动画</h1>
  <p>淡入淡出</p>
</div>
```

也就是说，整个从插入前到插入后，v-enter-active 样式类是一直有的，不过插入前会挂载 v-enter-from，插入后会挂载 v-enter-to

而这 3 个样式类所对应的样式分别是：

- v-enter-from：opacity: 0;
- v-enter-to：opacity: 1;
- v-enter-active：transition: opacity 3s;

这就自然出现了淡入淡出的效果。**当整个过渡效果结束后，这 3 个辅助样式类会一并被移除掉**。

## 其他相关细节

### 1. 过渡效果命名

假设 Transition 传递了 name 属性，那么就不会以 v 作为前缀，而是以 name 作为前缀：

```vue
<Transition name="fade">
                          ...
</Transition>
```

- fade-enter-from
- fade-enter-to
- fade-enter-active

另外还可以直接指定过渡的类是什么，可以传递这些 props 来指定自定义 class：

- enter-from-class
- enter-active-class
- enter-to-class
- leave-from-class
- leave-active-class
- leave-to-class

```vue
<template>
  <div>
    <button @click="show = !show">切换</button>
    <Transition 
      enter-active-class="fade" 
      leave-active-class="fade"
      enter-to-class="enter"
      enter-from-class="leave"
      leave-from-class="enter"
      leave-to-class="leave"
    >
      <div v-if="show">
        <h1>动画</h1>
        <p>淡入淡出</p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const show = ref(true)
</script>

<style scoped>
.fade {
  transition: 1s;
}
.enter {
  opacity: 1;
}
.leave {
  opacity: 0;
}
</style>
```

### 2. 搭配animation

也可以搭配 CSS 的 animation 来使用，这个时候只需要简单的在 *-enter/leave-active 样式类下使用动画即可。

```vue
<template>
  <div>
    <button @click="show = !show">切换</button>
    <Transition name="bounce">
      <div v-if="show">
        <h1>动画</h1>
        <p>跳动</p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  const show = ref(true)
</script>

<style scoped>
  .bounce-enter-active {
    animation: bounce-in 1s;
  }

  .bounce-leave-active {
    animation: bounce-in 1s reverse;
  }

  @keyframes bounce-in {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.5);
    }
    100% {
      transform: scale(1);
    }
  }
</style>
```

### 3. 常用属性

1. appear：在初始渲染时就应用过渡
2. mode：用于指定过渡模式，可选值有

- in-out：新元素先执行过渡，旧元素等待新元素过渡完成后再离开
- out-in：旧元素先执行过渡，旧元素过渡完成后新元素再进入

### 4. 使用key

有些时候会存在这么一种情况，就是不存在元素的进入和离开，仅仅是文本节点的更新，此时就不会发生过渡。

要解决这种情况也很简单，添加上 key 即可。

```vue
<template>
  <div>
    <button @click="show = !show">切换</button>
    <Transition name="fade" mode="out-in">
      <p :key="message">{{ message }}</p>
    </Transition>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  const show = ref(true)
  const message = computed(() => {
    return show.value ? 'Hello' : 'World'
  })
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 1s;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .fade-enter-to,
  .fade-leave-from {
    opacity: 1;
  }
</style>
```

### JS钩子

除了通过 CSS 来实现动画，常见的实现动画的方式还有就是 JS. Transition 组件也支持 JS 钩子的写法：

```vue
<Transition
  @before-enter="onBeforeEnter"
  @enter="onEnter"
  @after-enter="onAfterEnter"
  @enter-cancelled="onEnterCancelled"
  @before-leave="onBeforeLeave"
  @leave="onLeave"
  @after-leave="onAfterLeave"
  @leave-cancelled="onLeaveCancelled"
  >
  <!-- ... -->
</Transition>

<script setup>
  const onEnter = (el, done) => {
    // ...
  }
</script>
```

done 方法的作用如下：

1. 通知 Vue 过渡完成：在执行完自定义的进入或离开动画后，调用 done 方法告诉 Vue 当前过渡已完成，从而允许 Vue 继续处理 DOM 更新。
2. 处理异步操作：如果在过渡期间需要进行异步操作（例如等待数据加载或执行网络请求），可以在异步操作完成后调用 done 方法。

示例如下：

```vue
<template>
  <div class="container">
    <div class="btns">
      <button @click="show = !show">切换</button>
    </div>
    <!-- 之前是在特定的时间挂对应的 CSS 样式类 -->
    <!-- 现在是在特定的时间触发事件处理函数 -->
    <Transition @before-enter="beforeEnter" @enter="enter" @leave="leave">
      <p v-if="show" class="box">Hello World</p>
    </Transition>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  const show = ref(true)

  function beforeEnter(el) {
    // 在元素进入之前，设置初始样式
    el.style.opacity = 0
    el.style.transform = 'translateY(-20px)'
  }

  function enter(el, done) {
    // 这里设置 setTimeout 是为了让浏览器有时间应用初始样式
    // 将这个函数推到下一个事件循环中执行
    // 避免初始样式和目标样式在同一帧中执行
    setTimeout(() => {
      el.style.transition = 'all 1s'
      el.style.opacity = 1
      el.style.transform = 'translateY(0)'
      done()
    }, 0)
  }

  function leave(el, done) {
    // 因为元素已经在文档中了，直接设置样式即可
    el.style.transition = 'all 1s'
    el.style.opacity = 0
    el.style.transform = 'translateY(-20px)'
    // 这里的 setTimeout 是为了让动画执行完毕后再调用 done
    // 保证和过渡时间一致
    setTimeout(() => {
      done()
    }, 1000)
  }
</script>

<style scoped>
  .container {
    text-align: center;
  }
  .btns button {
    margin: 1em 0.5em;
  }
  .box {
    width: 200px;
    height: 50px;
    background-color: #42b983;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px auto;
  }
</style>
```

相比前面纯 CSS 的方式，JS 钩子在动画控制方面会更加灵活:

1. 精确控制过渡效果
2. 处理异步操作
3. 动态计算和条件逻辑
4. 与第三方库集成

#### 与第三方库集成

```vue
<script setup>
  import { ref } from 'vue'
  import { gsap } from 'gsap'
  const show = ref(true)

  function beforeEnter(el) {
    gsap.set(el, { opacity: 0, y: -20})
  }

  function enter(el, done) {
    gsap.to(el, {
      duration: 1,
      opacity: 1,
      y: 0,
      onComplete: done
    })
  }

  function leave(el, done) {
    gsap.to(el, {
      duration: 1,
      opacity: 0,
      y: -20,
      onComplete: done
    })
  }
</script>
```

## 案例

图片切换效果

```vue
<template>
  <div class="container">
    <div class="btns">
      <button @click="prev">上一张</button>
      <button @click="next">下一张</button>
    </div>
    <!-- 根据不同的方向，name不同 -->
    <!-- 下一张：next-image -->
    <!-- 上一张：prev-image -->
    <Transition :name="`${direction}-image`">
      <img class="image" :key="curIndex" :src="curImage" />
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 定义一个图片索引
const curIndex = ref(0)

// 图片数组
const images = [
  'https://10.idqqimg.com/eth/ajNVdqHZLLAJib8odhz8Th2Z4Gat0axooYaxANJlaLEwTomre0hx8Y5yib6FxDZxsgiaYG1W2ETbrU/130?tp=webp',
  'https://10.idqqimg.com/eth/ajNVdqHZLLDqYf0PtFibF9JNOnRbAw7DicWPicmfRkQwPeK2mnZ7ZJzZFdsCwCWdcwhEqoVphXiaDHE/130?tp=webp',
  'https://thirdqq.qlogo.cn/g?b=sdk&k=LaERpMuX1ZjWTQmhrhst6Q&s=100&t=0&tp=webp',
  'https://10.idqqimg.com/eth/ajNVdqHZLLDXIjdTYsqbfkxiaibd3lYGEgfiaEwficYfK2ogZDicCxaKibVibGA2Cj2ltgOvCm1tbRs1iac/130?tp=webp',
  'https://thirdqq.qlogo.cn/g?b=sdk&k=pfIficic6WRliaLULZudVI5Tw&s=640&t=1600139160&tp=webp'
]

// 定义一个移动方向
const direction = ref('next')

// 根据当前索引返回对应图片
const curImage = computed(() => images[curIndex.value])
// 最大索引值
const maxIndex = computed(() => images.length - 1)

function prev() {
  curIndex.value--
  if (curIndex.value < 0) {
    // 跳转到最后一张
    curIndex.value = maxIndex.value
  }
  direction.value = 'prev'
}

function next() {
  curIndex.value++
  if (curIndex.value > maxIndex.value) {
    // 跳转到第一张
    curIndex.value = 0
  }
  direction.value = 'next'
}
</script>

<style scoped>
/* 容器样式 */
.container {
  text-align: center;
}

/* 按钮样式 */
.btns button {
  margin: 1em 0.5em;
}

/* 图片样式 */
.image {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  position: absolute;
  left: 50%;
  margin-left: -100px;
  top: 100px;
}

/* active阶段需要过渡 */
.next-image-enter-active,
.next-image-leave-active,
.prev-image-enter-active,
.prev-image-leave-active {
  transition: 0.5s;
}

.next-image-enter-from,
.next-image-leave-to,
.prev-image-enter-from,
.prev-image-leave-to {
  opacity: 0;
}

.next-image-enter-from,
.prev-image-leave-to {
  transform: translateX(200px);
}

.next-image-leave-to,
.prev-image-enter-from {
  transform: translateX(-200px);
}
</style>
```

# 七、TransitionGroup

TransitionGroup 仍然是 Vue 里面一个内置的组件。作用：用于解决**多个元素**的过渡问题。

## 案例演示

下面的代码使用 Transition 为项目添加过渡效果，但是没有生效：

```vue
<template>
  <div class="container">
    <div class="btns">
      <button @click="addItem">添加项目</button>
      <button @click="removeItem">移除项目</button>
    </div>
    <Transition name="fade">
      <ul>
        <li v-for="item in items" :key="item" class="box">{{ item }}</li>
      </ul>
    </Transition>
  </div>
</template>
<script setup>
import { ref } from 'vue'

const items = ref(['内容1', '内容2', '内容3'])

const addItem = () => {
  items.value.push(`内容${items.value.length + 1}`)
}

const removeItem = () => {
  items.value.pop()
}
</script>
<style>
.container {
  text-align: center;
}
.btns button {
  margin: 1em 0.5em;
}
.box {
  background-color: #42b983;
  color: white;
  margin: 5px auto;
  padding: 10px;
  width: 200px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

问题🙋 为什么过渡不生效？

答案：因为这里对项目的新增和移除都是针对的 li 元素，但是 Transition 下面是 ul，ul 是一直存在的。

并且 Transition 下面只能有一个根元素。如果存放多个根元素，会报错：<Transition> expects exactly one child element or component.

此时就可以使用 TransitionGroup 来解决这个问题。代码重构如下：

```vue
<TransitionGroup name="fade" tag="ul">
  <li v-for="item in items" :key="item" class="box">{{ item }}</li>
</TransitionGroup>
```



## 相关细节

TransitionGroup 可以看作是 Transition 的一个升级版，它支持和 Transition 基本相同的 props、CSS 过渡 class 和 JavaScript 钩子监听器，但有以下几点区别： 

1. 默认情况下，它不会渲染一个容器元素。但可以通过传入 tag prop 来指定一个元素作为容器元素来渲染。 
2. 过渡模式 mode 在这里**不可用**，因为不再是在互斥的元素之间进行切换。 
3. 列表中的每个元素都必须有一个独一无二的 key attribute。
4. CSS 过渡 class **会被应用在列表内的元素上**，而不是容器元素上。



## 实战案例

使用过渡效果优化待办事项的显示效果

```vue
<template>
  <div class="container">
    <input
      type="text"
      v-model="newContent"
      class="todo-content"
      placeholder="请输入新的待办事项"
      @keypress.enter="addNewItem"
    />
  </div>
  <TransitionGroup tag="ul" name="fade" class="todo-container">
    <li v-for="item in todos" :key="item.id" class="todo">
      <span>{{ item.content }}</span>
      <button @click="deleteItem(item)">删除</button>
    </li>
  </TransitionGroup>
</template>

<script setup>
import { ref } from 'vue'

const newContent = ref('')

/**
 * 生成随机id
 */
function randomId() {
  return Math.random().toString(36).substr(2, 9)
}

const todos = ref([
  { id: randomId(), content: '任务1' },
  { id: randomId(), content: '任务2' },
  { id: randomId(), content: '任务3' }
])

function deleteItem(item) {
  todos.value = todos.value.filter((todo) => todo.id !== item.id)
}

function addNewItem() {
  if (newContent.value.trim() === '') return
  todos.value.unshift({
    id: randomId(),
    content: newContent.value
  })
  newContent.value = ''
}
</script>

<style scoped>
.container {
  width: 600px;
  margin: 1em auto;
  padding: 1.5em;
  border-radius: 5px;
}
.shuffle {
  margin: 1em 0;
}
.todo-content {
  box-sizing: border-box;
  width: 100%;
  height: 50px;
  border-radius: 5px;
  outline: none;
  font-size: 1.3em;
  padding: 0 1em;
  border: 1px solid #ccc;
}
.todo-container {
  list-style: none;
  padding: 0;
  margin: 1em 0;
}
.todo {
  padding: 0.5em 0;
  border-bottom: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1em;
}

/* xxx-enter-active 新元素进入的时候会挂这个类 */
/* xxx-leave-active 元素离开的时候会挂这个类 */
/* xxx-move 其他元素涉及到移动的时候，会挂这个类 */

.fade-enter-active,
.fade-leave-active,
.fade-move {
  transition: 0.5s;
}
.fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
```

【注意】如果涉及到其他元素移动，那么会挂上xx-move这个类

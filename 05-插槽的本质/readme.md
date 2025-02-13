复习插槽的概念：

- 子组件：通过 slot 来设置插槽
- 父组件：使用子组件时可以往 slot 的位置插入模板内容

插槽**使用层面**的本质：**父组件向子组件传递模板内容**

- 默认插槽：拥有默认的一些内容
- 具名插槽：给你的插槽取一个名字
- 作用域插槽：数据来自于子组件，通过插槽的形式传递给父组件使用

比如有如下的子组件与父组件：

**CardComponent.vue**

```vue
<template>
  <div class="card">
    <div class="card-header">
      <!-- vue3.4之后，如果属性名与值一样可以简写 -->
      <slot name="header" :title>
        <div>默认标题</div>
      </slot>
    </div>
    <div class="card-body">
      <slot>
        <div>默认内容</div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const title = ref('标题2')
</script>

<style>
.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 300px;
  margin: 20px;
}

.card-header {
  background-color: #f7f7f7;
  border-bottom: 1px solid #ececec;
  padding: 10px 15px;
  font-size: 16px;
  font-weight: bold;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.card-body {
  padding: 15px;
  font-size: 14px;
  color: #333;
}
</style>
```

**App.vue**

```vue
<template>
  <div>
    <CardComponent>
      <!-- 使用具名插槽 -->
      <template v-slot:header="slotsProps">
        <div>{{ slotsProps.title }}</div>
      </template>
      <!-- 向默认插槽中插入内容 -->
      <div class="card-content">
        <img src="./assets/landscape.jpeg" alt="Beautiful landscape" class="card-image" />
        <p>探索未知的自然风光，记录下每一个令人惊叹的瞬间。加入我们的旅程，一起见证世界的壮丽。</p>
      </div>

    </CardComponent>
  </div>
</template>

<script setup>
import CardComponent from './components/CardComponent.vue'

</script>

<style scoped>
.card-image {
  width: 100%;
  height: auto;
  border-bottom: 1px solid #ececec;
}
</style>
```

### 父组件传递内容的本质

父组件在使用子组件时，向子组件插槽中传递一些内容，实际上传递的是一个对象：

default为默认插槽的名称，xxx为具名插槽的名称

对应的function的执行结果实际上对应的是传入内容的虚拟DOM

```javascript
{
  default: function(){ ... },
  xxx: function(){ ... },
  xxx: function(){ ... },
}
```

对于上面的例子来讲，父组件传递的就是这样的一个对象：

```jsx
{
  default: function(){
    // 注意返回值是对应结构的虚拟 DOM
    return (
         <div class="card-content">
        <img src="./assets/landscape.jpeg" alt="Beautiful landscape" class="card-image" />
        <p>探索未知的自然风光，记录下每一个令人惊叹的瞬间。加入我们的旅程，一起见证世界的壮丽。</p>
      </div>
    )
  },
  header: function(){
    return (
        <div>摄影作品</div>
    )
  }
}
```

**父组件向子组件传递过去的东西本质上是函数，通过调用这些函数，能够得到对应结构的虚拟 DOM。**



### 子组件设置插槽的本质

其实就是对父组件传递过来的函数进行调用，得到对应的虚拟 DOM.

```javascript
// 这个slots就是父组件传递过来的对象
const slots = {
  default: function(){ ... },
  xxx: function(){ ... },
  xxx: function(){ ... },
}; // 该对象是父组件传递过来的对象
slots.default(); // 得到要渲染的虚拟DOM 
slots.header(); // 得到要渲染的虚拟DOM
slots.xxx(); // 得到要渲染的虚拟DOM                   
import { defineComponent, h } from "vue"
import styles from './CardComponent.module.css'

export default defineComponent({
  name: 'CardComponent',
  setup(_, {slots}) {
    console.log('slots..', slots)
    return () => {
      return h('div', {class: styles.card}, [
        h('div', {class: styles['card-header']}),
        h('div', {class: styles['card-body']})
      ])
    }
  }
})
```

通过打印slots可以看出：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739428204474-622eeaf1-ecda-4bb3-8369-e06957d8beb1.png)

传递进来的slots是一个对象，默认插槽default与具名插槽header对应的是一个函数。

调用函数便可以得到插槽中对应模板内容的虚拟DOM：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739428367096-4514f73b-c703-45bd-9533-2a50b5f0e57a.png)

因为插槽中可以传入多个节点，所以最终结果是一个数组，数组中的每一项即对应每个节点内容的虚拟DOM

### 进行验证

最后，我们需要对上面的说法进行验证。

```javascript
import { defineComponent, h, ref } from "vue"
import styles from './CardComponent.module.css'

export default defineComponent({
  name: 'CardComponent',
  setup(_, {slots}) {
    const defaultSlotsVNode = slots.default()
    const title = ref('子组件传递的标题')

    let headerSlotsVNode = null
    // 如果传递了header插槽那么就调用
    if (slots.header) {
      // 作用域插槽的本质就是子组件在调用父组件传递的函数的时候传递参数过去
      headerSlotsVNode = slots.header({
        title: title.value
      })
    }
    // 没有传递header插槽，以及传递了但是其中没有内容都要使用默认内容
    if (!headerSlotsVNode) {
      headerSlotsVNode = h('div', null, '默认标题')
    }

    return () => {
      return h('div', {class: styles.card}, [
        h('div', {class: styles['card-header']}, headerSlotsVNode),
        h('div', {class: styles['card-body']}, defaultSlotsVNode)
      ])
    }
  }
})
```
## 回顾computed的用法

首先回顾一下 computed 的基本用法：

```javascript
const state = reactive({
  a: 1,
  b: 2
})

const sum = computed(() => {
  return state.a + state.b
})
const firstName = ref('John')
const lastName = ref('Doe')

const fullName = computed({
  get() {
    return firstName.value + ' ' + lastName.value
  },
  set(newValue) {
    ;[firstName.value, lastName.value] = newValue.split(' ')
  }
})
```



## 实现computed方法

computed函数中接收到的参数，可能是一个getter函数，也可能是一个包含getter和setter的对象

### 1 参数归一化

首先第一步，我们需要对参数进行归一化，如下所示：

```javascript
function normalizeParam(getterOrOptions) {
  let getter, setter;
  if (typeof getterOrOptions === "function") {
    getter = getterOrOptions;
    setter = () => {
      console.warn(`Computed property was assigned to but it has no setter.`);
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return { getter, setter };
}
```

上面的方法就是对传入 computed 的参数进行归一化，无论是传递的函数还是对象，统一都转换为对象。

### 2 处理返回值与依赖建立

computed返回的计算属性实际上是一个对象，在使用的时候通过`xx.value`去获取计算出的值。通过`xx.value = xx`的方式来重新设置值。

那么可以通过给对象添加get与set方法来处理获取value与设置value的逻辑：

1. 设置value的时候实际上就是运行传入的setter方法
2. 获取value的时候要建立响应式对象属性与回调函数的依赖关系

```javascript
export function computed(getterOrOptions) {
  const { getter, setter} = normalizeParam(getterOrOptions)
  let value // 存储计算属性计算出的结果
  const effectFn = effect(getter, {
    lazy: true
  })
  const obj = {
    get value() {
      value = effectFn()
      return value
    },
    set value(newValue) {
      setter(newValue)
    }
  }
  return obj
}
```

需要注意的是，在通过`.value`获取计算属性值时才进行依赖收集，所以effect中的回调是懒执行的，需要根据实现的effect，传入lazy: true

### 3 处理重复执行的问题

此时会遇到如下问题：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739347196004-6c9e3904-49b8-405d-b3ef-96c08979be0e.png)

多次访问result.value，都会去执行一遍传入的回调。

这是因为在访问.value的时候都会去调取一遍effectFn去收集依赖。

如何解决呢？

此时可以设置一个开关，调取完effectFn时关闭开关，防止重新调取：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739347504735-89c213a2-910f-4e6f-a767-a074dafedc70.png)

此时又会遇到一个新的问题，如果依赖的属性值发生改变，effectFn重新执行后，获取到的value还是之前的值。（因为dirty为false）：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739348224432-437a7441-f03a-4fac-9ddf-477ccc400c68.png)



基于之前实现的effect，可以传递自定义方法，在派发更新的时候让用户自定义执行逻辑。所以可以在自定义方法中将dirty设置为true即可：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739348179042-65e66f7b-01e0-481a-a2d5-725919ca6376.png)

这样的话：

1. 当state.a = 2改变之后会触发trigger，由于在trigger时传入了自定义的shcheduler方法，所以会将dirty变为true
2. 再次访问result.value时，由于dirty为true会重新执行effectFn方法，所以会计算出新的值并返回

### 4 处理函数依赖计算属性的情况

目前为止，计算属性工作一切正常，但是这种情况，某一个函数依赖计算属性的值，例如渲染函数。那么此时计算属性值的变化，应该也会让渲染函数重新执行才对。例如：

```javascript
const state = reactive({
  a: 1,
  b: 2,
});
const sum = computed(() => {
  console.log("执行了...");
  return state.a + state.b;
});

effect(() => {
  // 假设这个是渲染函数，依赖了 sum 这个计算属性
  console.log("render", sum.value);
});

state.a++
console.log(sum.value)
```

执行结果如下：

```javascript
执行了...
render 3
执行了...
4
```

1. 首先传入computed中的回调是懒执行的，没有访问sum.value是不会执行的。
2. effect中的回调此时是立即执行，执行时访问了.value，所以computed中的回调会开始执行，输出执行了...
3. 然后effect中的回调执行完毕输出render 3
4. 紧接着a进行了改变，dirty变为了true，紧接着访问了sum.value，又会去执行computed中的回调
5. 此时sum.value改变了，但是由于没有针对计算属性返回的对象中的value属性进行track，以及计算属性的getter函数依赖的响应式数据发生改变时没有去触发 对value属性依赖函数的派发更新，所以不会重新执行render

此时需要针对这种情况去处理：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739351256188-1536a145-4c4a-4643-a09e-6afbded6d32b.png)

### 5 完整代码

```javascript
import { effect } from "../02-响应式系统/effect/effect.js"
import track from "../02-响应式系统/effect/track.js"
import trigger from "../02-响应式系统/effect/trigger.js"
import { TrackOpTypes, TriggerOpTypes } from "../02-响应式系统/utils.js"
// 参数归一化
function normalizeParam(getterOrOptions) {
  let getter, setter
  if (typeof getterOrOptions === 'function') {
    getter = getterOrOptions
    setter = () => {
      console.warn('it has no setter function')
    }
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return { getter, setter}
}

export function computed(getterOrOptions) {
  const { getter, setter} = normalizeParam(getterOrOptions)

  let value // 存储计算属性计算出的结果
  let dirty = true // 是否为脏数据，如果是则重新计算

  const effectFn = effect(getter, {
    lazy: true,
    shcheduler() {
      dirty = true
      // 说明getter依赖的响应式数据发生了改变，那么就需要手动触发依赖计算属性的函数进行重新执行
      trigger(obj, TriggerOpTypes.SET, 'value')
    }
  })
  const obj = {
    get value() {
      track(obj, TrackOpTypes.GET, 'value')
      if(dirty) {
        value = effectFn()
        dirty = false
      }
      return value
    },
    set value(newValue) {
      setter(newValue)
    }
  }
  return obj
}
```
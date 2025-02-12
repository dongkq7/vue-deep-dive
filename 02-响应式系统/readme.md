## 实现基本框架

### 核心要素

要实现一个响应式系统，最为核心的有两个部分：

1. 监听数据的读写（读取数据的时候需要收集依赖，写入数据的时候需要派发更新）
2. 关联数据和函数

只要把这两个部分完成了，那么整个响应式系统也就基本成型了。

数据响应式的本质就是：数据改变后运行与数据相关的函数



### 监听数据读写

- 数据：在 JS 中，能够拦截读写的方式，要么 Object.defineProperty，要么就是 Proxy，这两个方法针对的目标是对象，因此我们这里考虑对对象类型进行监听
- 读写：虽然说是监听读写，但是细分下来要监听的行为如下：

- 获取属性：读取
- 设置属性：写入
- 新增属性：写入
- 删除属性：写入
- 是否存在某个属性：读取
- 遍历属性：读取

#### reactive.js

```javascript
// 这是一个入口文件，会提供一个reactive API
// 该方法接收到一个对象，返回一个Proxy对象

export function reactive(target) {
  const proxy = new Proxy(target, {
    get(target, key) {
      console.log('拦截到了get操作')
      return Reflect.get(target, key)
    },
    set(target, key, value) {
      console.log('拦截到了set操作')
      return Reflect.set(target, key, value)
    }
  })

  return proxy
}
```

#### 代码结构抽取

逻辑全在reactive.js中写会比较乱，可以将代码结构抽取一下

![img](https://cdn.nlark.com/yuque/0/2025/jpeg/22253064/1739157296418-4e0936ad-955c-4372-9d27-e763d3dcf8a0.jpeg)

handlers/index.js

```javascript
import getHandler from "./behavior/getHandler.js"
import setHandler from "./behavior/setHandler.js"

export default {
  get: getHandler,
  set: setHandler
}
```

handlers/behavior/getHandler.js

```javascript
export default function(target, key) {
  console.log('拦截到了get操作')
  return Reflect.get(target, key)
}
```

handlers/behavior/setHandler.js

```javascript
export default function(target, key, value) {
  console.log('拦截到了set操作')
  return Reflect.set(target, key, value)
}
```

reactive.js

```javascript
// 这是一个入口文件，会提供一个reactive API，该方法接收到一个对象，返回一个Proxy对象
import handlers from './handlers/index.js'

export function reactive(target) {
  const proxy = new Proxy(target, handlers)

  return proxy
}
```

### 拦截后对应的处理

不同的行为，拦截下来后要做的事情是不一样的。整体来讲分为两大类：

- 收集器：**针对读取的行为**，会触发收集器去**收集依赖**，所谓收集依赖，其实就是建立数据和函数之间的依赖关系
- 触发器：**针对写入行为**，触发器会工作，触发器所做的事情就是**触发数据所关联的所有函数**，让这些函数重新执行

下面是不同行为对应的事情：

- 获取属性：收集器(getHandler)
- 设置属性：触发器(setHandler)
- 新增属性：触发器(setHandler)
- 删除属性：触发器(deleteHandler)
- 是否存在某个属性：收集器(hasHandler)
- 遍历属性：收集器(ownKeysHandler)

总结起来也很简单，**只要涉及到属性的访问，那就是收集器，只要涉及到属性的设置（新增、删除都算设置），那就是触发器**。

```javascript
// handlers/behavior/getHandler.js
import track from "../../effect/track.js"
import { TrackOpTypes, isObject } from "../../utils.js"
import { reactive } from "../../reactive.js"

export default function(target, key) {

  // 拦截到get操作，那么就需要去收集依赖
  track(target, TrackOpTypes.GET, key)

  const result = Reflect.get(target, key)
  // 如果得到的结果是一个对象，那么需要递归处理成代理对象
  if (isObject(result)) {
    return reactive(result)
  }
  return Reflect.get(target, key)
}

// handlers/behavior/setHandler.js
import trigger from "../../effect/trigger.js"
import { TriggerOpTypes, hasChanged} from "../../utils.js"


export default function(target, key, value) {
  // 由于新增属性也会触发set，所以需要进一步判断下是新增属性还是修改
  const type = target.hasOwnProperty(key) ? TriggerOpTypes.SET : TriggerOpTypes.ADD

  const oldValue = target[key]
  const result = Reflect.set(target, key, value)

  // 值改变了那么就进行派发更新
  if (hasChanged(oldValue, value)) {
    trigger(target, type, key)
  }
  return  result
}

// handlers/behavior/deleteHandler.js
import trigger from '../../effect/trigger.js'
import { TriggerOpTypes } from '../../utils.js'

export default function(target, key) {
  const hasKey = target.hasOwnProperty(key)

  const result = Reflect.deleteProperty(target, key)
  // 如果删除的key存在且删除成功那么执行触发器
  if (hasKey && result) {
    trigger(target, TriggerOpTypes.DELETE, key)
  }
  return result
}

// handlers/behavior/hasHandler.js
import track from "../../effect/track.js"
import { TrackOpTypes } from "../../utils.js"

export default function(target, key) {
  track(target, TrackOpTypes.HAS, key)
  return Reflect.has(target, key)
}

// handlers/behavior/ownKeysHandler.js
import track from "../../effect/track.js"
import { TrackOpTypes } from "../../utils.js"

export default function (target) {

  track(target, TrackOpTypes.ITERATE);
  
  return Reflect.ownKeys(target);
}
```

behavior/index.js

```javascript
import getHandler from "./behavior/getHandler.js"
import setHandler from "./behavior/setHandler.js"
import deleteHandler from "./behavior/deleteHandler.js"
import hasHandler from "./behavior/hasHandler.js"
import ownKeysHandler from "./behavior/ownKeysHandler.js"


export default {
  get: getHandler,
  set: setHandler,
  deleteProperty: deleteHandler,
  has: hasHandler,
  ownKeys: ownKeysHandler
}
```

### 完善一下reactive.js

1. 如果不是对象，则无需代理，直接返回
2. 判断之前是否代理过（可用weakmap去保存原始对象与代理对象的映射关系），如果代理过那么直接返回

```javascript
// 这是一个入口文件，会提供一个reactive API，该方法接收到一个对象，返回一个Proxy对象
import handlers from './handlers/index.js'
import { isObject } from './utils.js'

const proxyMap = new WeakMap()

export function reactive(target) {
  // 如果不是对象，直接返回
  if (!isObject(target)) {
    return target
  }
  // 判断是否已经代理过了，已经代理过就直接返回代理过的对象
  if (proxyMap.has(target)) {
    return proxyMap.get(target)
  }
  const proxy = new Proxy(target, handlers)
  // 保存一下原始对象与代理对象的映射
  proxyMap.set(target, proxy)
  return proxy
}
```

### 数组中查找对象

因为在进行代理的时候，是进行了递归代理的，也就是说对象里面成员包含对象的话，也会被代理，这就会导致数组中成员有对象的话，是找不到的。原因很简单，比较的是原始对象和代理对象，自然就找不到。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739176508257-fbd9f528-8fd0-40a0-8ab8-f01bd65ee77f.png)

解决方案：先正常找，找不到就在原始对象中重新找一遍。

那么就需要针对`includes`、`indexOf`、`lastIndexOf`这几个查找方法进行重写。

- 一旦调取这些方法，首先会触发代理对象xx方法的get操作，所以在getHandler中进行判断，如果是数组且读取的是这些特定方法那么就返回重写后的方法即可

重写的逻辑即：先正常寻找，找不到再在原始对象中找。那么怎么获取到原始对象呢？

- 可以将原始对象保存在一个特殊标识的字段里（这个字段可以是Symbol类型）
- 当获取该字段的值时即会触发当前代理对象的get方法，在get方法中对key进行判断，如果key为该字段，那么直接返回`target`即可

```javascript
import track from "../../effect/track.js"
import { RAW, TrackOpTypes, isObject } from "../../utils.js"
import { reactive } from "../../reactive.js"

const arrayInstrumentations = {};
['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
  arrayInstrumentations[method] = function(...args) {
    const result = Array.prototype[method].apply(this, args)
    // 如果没找到那么就在原始对象中再找一遍
    if (result < 0 || result === false) {
      return Array.prototype[method].apply(this[RAW], args)
    }
    return result
  }
})

export default function(target, key) {

  // 表示想获取原始对象
  if (key === RAW) {
    return target
  }
  // 拦截到get操作，那么就需要去收集依赖
  track(target, TrackOpTypes.GET, key)

  // 如果是数组，且获取的是特定的方法，那么返回重写后的
  if(arrayInstrumentations.hasOwnProperty(key) && Array.isArray(target)) {
    return arrayInstrumentations[key]
  }
  const result = Reflect.get(target, key)
  // 如果得到的结果是一个对象，那么需要递归处理成代理对象
  if (isObject(result)) {
    return reactive(result)
  }
  return Reflect.get(target, key)
}
```

### 数组改动长度

关于数组长度的改变，也会有一些问题，如果是隐式的改变长度，不会触发 length 的拦截。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739177368009-5959e1c6-afc1-4c75-ad55-7d04ff7067c6.png)

可见，此时只触发了5的add操作，并没有触发length的set操作。所以需要在set的时候额外判断下是否是数组且length发生了改变，如果length发生了改变并且是隐式改变，需要额外触发一下length的set操作。



另外即便是显式的设置 length，这里会涉及到新增和删除，新增情况下的拦截是正常的，但是在删除的情况下，不会触发 DELETE 拦截，因此也需要手动处理。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739177880750-5030264b-2128-4834-84c0-b04aa2401dae.png)

可见以上并没有触发属性1与属性2对应的delete操作。

```javascript
import trigger from "../../effect/trigger.js"
import { TriggerOpTypes, hasChanged} from "../../utils.js"


export default function(target, key, value) {
  // 由于新增属性也会触发set，所以需要进一步判断下是新增属性还是修改
  const type = target.hasOwnProperty(key) ? TriggerOpTypes.SET : TriggerOpTypes.ADD

  const oldLen = Array.isArray(target) ? target.length : undefined

  const oldValue = target[key]
  const result = Reflect.set(target, key, value)

  // 值改变了那么就进行派发更新
  if (hasChanged(oldValue, value)) {
    trigger(target, type, key)

    // 如果是数组，且length发生了改变，是隐式行为造成的那么就需要额外触发一下length的set操作
    if (Array.isArray(target) && oldLen !== target.length) {
      if (key !== 'length') {
        trigger(target, TriggerOpTypes.SET, 'length')
      } else {
        // 处理一下显式改变length没有触发delete操作的情况
        for(let i = target.length; i < oldLen; i++) {
          trigger(target, TriggerOpTypes.DELETE, i+'')
        }
      }
    }
  }
  return  result
}
```

### 自定义是否要收集依赖

当调用 push、pop、shift 、unshift等方法的时候，因为涉及到了 length 属性的变化，会触发依赖收集（因为触发了length的get操作），这是我们不期望的：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739178018290-2ab7d9a1-2d64-47f3-9b24-ddd17819f5c3.png)

最好的方式，就是由我们来控制是否要依赖收集。

在track.js中可以通过一个开关来控制，同时暴露出修改的方法来暂停/恢复 依赖收集：

```javascript
import { TrackOpTypes } from "../utils.js"

let shouldTrack = true
// 暂停收集依赖
export function pauseTracking() {
  shouldTrack = false
}
// 恢复收集依赖
export function resumeTracking() {
  shouldTrack = true
}

export default function(target, type, key) {
  if (!shouldTrack) return

  if (type === TrackOpTypes.ITERATE) {
    console.log(`收集器：代理对象的${type}操作被拦截`)
    return
  }
  console.log(`收集器：代理对象${key}属性的${type}操作被拦截`)
}
```

在getHandler中对这些数组方法进行重写：

```javascript
['push', 'pop', 'shift', 'unshift'].forEach(method => {
  arrayInstrumentations[method] = function(...args) {
    pauseTracking()
    const res = Array.prototype[method].apply(this, args)
    resumeTracking()
    return res
  }
})
```

## 图解effect（vue中的重要方法）

effect 方法的作用：就是将 **函数** 和 **数据** 关联起来。

回忆 watchEffect

```vue
import { ref, watchEffect } from "vue";
const state = ref({ a: 1 });
const k = state.value;
const n = k.a;
// 这里就会整理出 state.value、state.value.a
watchEffect(() => {
  console.log("运行");
  state;
  state.value;
  state.value.a;
  n;
});
setTimeout(() => {
  state.value = { a: 3 }; // 要重新运行，因为是对 value 的写入操作
}, 500);
```

effect函数的设计：

```javascript
// 原始对象
const data = {
  a: 1,
  b: 2,
  c: 3,
};
// 产生一个代理对象
const state = new Proxy(data, { ... });
effect(() => {
  console.log(state.a);
});
```

在上面的代码中，向 effect 方法传入的回调函数中，访问了 state 的 a 成员，然后我们**期望 a 这个成员和这个回调函数建立关联。**

### 第一版

第一版实现如下：

```javascript
let activeEffect = null; // 记录当前的函数
const depsMap = new Map(); // 保存依赖关系

function track(target, key) {
  // 建立依赖关系
  if (activeEffect) {
    let deps = depsMap.get(key); // 根据属性值去拿依赖的函数集合
    if (!deps) {
      // 创建一个新的集合
      // 这里使用set是为了防止一个effect回调中重复获取同一个属性值，从而重复添加依赖的问题
      deps = new Set(); 
      depsMap.set(key, deps); // 将集合存入 depsMap
    }
    // 将依赖的函数添加到集合里面
    deps.add(activeEffect);
  }
  console.log(depsMap);
}

function trigger(target, key) {
  // 这里面就需要运行依赖的函数
  const deps = depsMap.get(key);
  if (deps) {
    deps.forEach((effect) => effect());
  }
}

// 原始对象
const data = {
  a: 1,
  b: 2,
  c: 3,
};
// 代理对象
const state = new Proxy(data, {
  get(target, key) {
    track(target, key); // 进行依赖收集
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    trigger(target, key); // 派发更新
    return true;
  },
});

/**
 *
 * @param {*} fn 回调函数
 */
function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

effect(() => {
  // 这里在访问 a 成员时，会触发 get 方法，进行依赖收集
  console.log('执行函数')
  console.log(state.a);
});
state.a = 100;
```

- 依赖函数使用set存储：这里使用set是为了防止一个effect回调中重复获取同一个属性值，从而重复添加依赖的问题；以及防止trigger时执行回调函数，函数中读取属性时再次重复添加
- 为什么第一次执行回调后，要把activeEffect，很容易理解，是为了防止在effect回调函数外读取属性重复添加的问题，以及，在trigger时执行回调时再次将回调函数添加进去的问题（虽然用了set，但是还会去执行添加依赖的逻辑）

第一版实现，**每个属性对应一个 Set 集合**，该集合里面是所依赖的函数，所有属性与其对应的依赖函数集合形成一个 map 结构，如下图所示：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737525791273-50279451-bae7-4af6-8a1d-c3a5e95bd631.png)

activeEffect 起到一个中间变量的作用，临时存储这个回调函数，等依赖收集完成后，再将这个临时变量设置为空即可。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737525791281-2c6f5386-4e19-41a5-ab80-65730504faa4.png)

### 问题1

**问题一**：每一次运行回调函数的时候，都应该确定新的依赖关系。

稍作修改：

```javascript
effect(() => {
  if (state.a === 1) {
    state.b;
  } else {
    state.c;
  }
  console.log("执行了函数");
});
state.a = 100
```

在上面的代码中，两次运行回调函数，所建立的依赖关系应该是不一样的：

- 第一次：a、b
- 第二次：a、c

第一次运行依赖如下：

```plain
Map(1) { 'a' => Set(1) { [Function (anonymous)] } }
Map(2) {
  'a' => Set(1) { [Function (anonymous)] },
  'b' => Set(1) { [Function (anonymous)] }
}
执行了函数
```

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737525791269-29e3445f-18a5-45a8-be4d-25402ceb59bb.png)

执行 state.a = 100

依赖关系变为了：

```plain
Map(1) { 'a' => Set(1) { [Function (anonymous)] } }
Map(2) {
  'a' => Set(1) { [Function (anonymous)] },
  'b' => Set(1) { [Function (anonymous)] }
}
执行了函数
Map(2) {
  'a' => Set(1) { [Function (anonymous)] },
  'b' => Set(1) { [Function (anonymous)] }
} // 这里是if条件语句中读取state.a时触发的track
Map(2) {
  'a' => Set(1) { [Function (anonymous)] },
  'b' => Set(1) { [Function (anonymous)] }
} // 这里读取state.c时触发的track
执行了函数
```

当 a 的值修改为 100 后，依赖关系应该重新建立，也就是说：

- 第一次运行：建立 a、b 依赖
- 第二次运行：建立 a、c 依赖

那么现在 a 的值明明已经变成 100 了，为什么重新执行回调函数的时候，没有重新建立依赖呢？

原因也很简单，如下图所示：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737525791318-fcefcb17-c3de-4bb6-9cfe-ac2d8d596e31.png)

**第一次建立依赖关系的时候，是将依赖函数赋值给 activeEffect，最终是通过 activeEffect 这个中间变量将依赖函数添加进依赖列表的**。依赖函数执行完毕后，activeEffect 就设置为了 null，之后 a 成员的值发生改变，重新运行的是回调函数（回调函数仅仅是传入effect的那一个函数，里面并没有给activeEffect重新赋值），但是 activeEffect 的值依然是 null，这就会导致 track 中依赖收集的代码根本进不去：

```javascript
function track(target, key) {
  if (activeEffect) {
    // ...
  }
}
```

怎么办呢？也很简单，**我们在收集依赖的时候，不再是仅仅收集回调函数，而是收集一个包含 activeEffect 的环境**，继续改造 effect：

```javascript
function effect(fn) {
  const environment = () => {
    activeEffect = environment;
    fn();
    activeEffect = null;
  };
  environment();
}
```

这里 activeEffect 对应的值，不再是像之前那样是回调函数，而是一整个 environment 包含环境信息的函数，这样当重新执行依赖的函数的时候，执行的也就是这个环境函数，而环境函数的第一行就是 activeEffect 赋值，这样就能够正常的进入到依赖收集环节。

如下图所示：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737525791393-08c330ed-0c78-47cb-9a68-aa1053bddac9.png)

### 问题2

**问题二：**旧的依赖没有删除

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737530164493-fdd84de0-bec2-45e5-9618-acc8bdf8d17a.png)

在修改了a的值后重新执行回调函数的时候，depsMap中应该只有a与c同依赖函数之间有联系

解决方案：在执行 fn 方法之前，先调用了一个名为 cleanup 的方法，该方法的作用就是用来清除依赖。

该方法代码如下：

1. 首先要拿到当前环境函数被哪些属性所依赖
2. 由于函数也是对象，可以在初次执行effect回调函数（环境函数）之前为函数定义一个数组用来记录环境函数在哪些集合里面
3. ![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737531429317-ea486884-5bad-4d64-b541-b4808c90c311.png)



```javascript
function cleanup(environment) {
  let deps = environment.deps; // 拿到当前环境函数的依赖（是个数组）
  if (deps.length) {
    deps.forEach((dep) => {
      dep.delete(environment);
      if (dep.size === 0) {
        for (let [key, value] of depsMap) {
          if (value === dep) {
            depsMap.delete(key);
          }
        }
      }
    });
    // 这里使用deps.length = 0将数组清空，不会改变数组的引用
    deps.length = 0;
  }
}
```

具体结构如下图所示：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737525791641-5343104e-febb-4d8e-b633-95b8b9f734ab.png)

### 问题3

**测试多个依赖函数**

```javascript
effect(() => {
  if (state.a === 1) {
    state.b;
  } else {
    state.c;
  }
  console.log("执行了函数1");
});
effect(() => {
  console.log(state.c);
  console.log("执行了函数2");
});
state.a = 2;
effect(() => {
  if (state.a === 1) {
    state.b;
  } else {
    state.c;
  }
  console.log("执行了函数1");
});
effect(() => {
  console.log(state.a);
  console.log(state.c);
  console.log("执行了函数2");
});
state.a = 2;
```

针对以上代码：

1. 首先会执行environment1函数，执行完毕后，{'a' -> SetA[ev1], 'b' -> SetB[ev1]}
2. 然后执行environment2函数，执行完毕后，{'a' -> SetA[ev1, ev2], 'b'-> SetB[ev1], 'c' -> SetC[ev2] }
3. a的值发生改变，会执行trigger方法，拿到a对应的SetA[ev1, ev2]，依次执行ev1与ev2
4. 当执行ev1时:

1. 首先activeEffect变为ev1，紧接着清理ev1相关的依赖，此时depsMap变为**{'a' -> SetA[ev2], 'c' -> SetC[ev2] }**。
2. 然后执行ev1中的fn，访问state.a，此时会触发a的依赖收集与c的依赖收集，变为**{'a' -> SetA[ev2, ev1], 'c' -> SetC[ev2, ev1] }**

1. 然后执行ev2:

1. 此时activeEffect变为ev2，紧接着清理ev2相关的依赖，此时depsMap变为**{'a' -> SetA[ev1], 'c' -> SetC[ev1] }**。
2. 然后执行ev2中的fn，访问state.a与state.c，此时又会触发依赖收集，变为变为**{'a' -> SetA[ev1, ev2], 'c' -> SetC[ev1, ev2] }**



不执行 `cleanup` 逻辑时，依赖集合会不断累积，`track` 函数添加依赖时因 `Set` 的去重特性不会导致重复添加，避免了无限循环。而执行 `cleanup` 逻辑时，每次执行副作用函数前清理旧依赖，重新收集依赖，在 `trigger` 遍历依赖集合执行副作用函数过程中，可能因 `track` 函数添加依赖影响遍历集合，导致无限循环。不过，通常为了保证依赖的准确性，还是需要 `cleanup` 逻辑，同时配合创建依赖集合副本进行遍历的方式来避免无限循环问题。



`Set` 对象的 `forEach` 方法在遍历过程中，如果集合本身被修改（添加或删除元素），其行为可能不符合我们的预期。和数组的 `forEach` 不同，`Set` 的 `forEach` 不会根据一个固定的长度来决定循环次数，而是会持续遍历集合中的元素，直到所有元素都被访问过。如果在遍历过程中向集合中添加了新元素，`forEach` 会继续遍历这些新添加的元素。

解决无限循环问题：

要解决这个问题，可以在 trigger 函数中添加一些机制来防止重复触发同一个 effect 函数，比如使用一个 Set 来记录已经触发过的 effect 函数：

```javascript
function trigger(target, key) {
  const deps = depsMap.get(key);
  if (deps) {
    const effectsToRun = new Set(deps); // 复制一份集合，防止在执行过程中修改原集合
    effectsToRun.forEach((effect) => effect());
  }
}
```

### 问题4

需要注意的是，要在遍历执行effectFns时加入判断：`if (effectFn !== activeEffect)`，不然以下情况会造成无限执行：

```javascript
effect(() => {
  console.log('fn1')
  state.a = state.a + 2
})
```

这段代码中，函数内部对响应式对象 `state` 的属性 `a` 进行了修改。这会造成一个问题：修改 `state.a` 会触发依赖更新，而更新时又会重新执行这个副作用函数，从而陷入无限循环。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739339373341-b0372a55-07d5-4c98-9c9b-788489eba1d3.png)

### 问题5

**测试嵌套函数**

```javascript
effect(() => {
  effect(() => {
    state.a
    console.log("执行了函数2");
  });
  state.b;
  console.log("执行了函数1");
});
```

会发现所建立的依赖又不正常了：

```plain
Map(1) { 'a' => Set(1) { [Function: environment] { deps: [Array] } } }
执行了函数2
Map(1) { 'a' => Set(1) { [Function: environment] { deps: [Array] } } }
执行了函数1
```

究其原因，是目前的函数栈有问题，当执行到内部的 effect 函数时，会将 activeEffect 设置为 null，如下图所示：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737525791770-f2db7057-a369-4c20-8849-6a8359106486.png)

解决方案：模拟函数栈的形式。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739328726783-2862a521-122f-4c91-8feb-f18689352a55.png)

### 最终版

```javascript
let activeEffect = null; // 记录当前的函数
// 这里没有使用WeakMap是因为WeakMap无法遍历且WeakMap的key只能是对象
const depsMap = new Map(); // 保存依赖关系
const effectStack = []; // 保存函数栈

function track(target, key) {
  // 建立依赖关系
  if (activeEffect) {
    let deps = depsMap.get(key); // 根据属性值去拿依赖的函数集合
    if (!deps) {
      deps = new Set(); // 创建一个新的集合
      depsMap.set(key, deps); // 将集合存入 depsMap
    }
    // 将依赖的函数添加到集合里面
    deps.add(activeEffect);
    activeEffect.deps.push(deps); // 将当前的依赖的集合添加到函数里面
  }
  console.log(depsMap);
}

function trigger(target, key) {
  // 这里面就需要运行依赖的函数
  const deps = depsMap.get(key);
  if (deps) {
    const effectsToRun = new Set(deps);
    effectsToRun.forEach((effect) => effect());
  }
}

// 原始对象
const data = {
  a: 1,
  b: 2,
  c: 3,
};
// 代理对象
const state = new Proxy(data, {
  get(target, key) {
    track(target, key); // 进行依赖收集
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    trigger(target, key); // 派发更新
    return true;
  },
});

/**
 *
 * @param {*} fn 回调函数
 */
function effect(fn) {
  const environment = () => {
    activeEffect = environment;
    // 将环境函数推入栈（其实就是在模拟真实的函数栈）
    effectStack.push(environment);
    // 清理依赖
    cleanup(environment);
    fn();
    // activeEffect = null;
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
  };
  environment.deps = []; // 用来记录该环境函数在哪些集合里面
  environment();
}

function cleanup(environment) {
  let deps = environment.deps; // 拿到当前环境函数的依赖数组
  if (deps.length) {
    deps.forEach((dep) => {
      dep.delete(environment); // 删除依赖
      if (dep.size === 0) {
        for (let [key, value] of depsMap) {
          if (value === dep) {
            depsMap.delete(key);
          }
        }
      }
    });
    deps.length = 0;
  }
}
```

## 关联数据和函数

**依赖收集**

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1737620227817-b4c52220-a2b0-4323-8198-8c7481f9ab3f.png)

【targtMap】key为对象，value是一个map

【propMap】key为对象中的每个属性（存在一个特殊的属性ITERATER，因为对对象的遍历不存在特定的对某个属性进行操作），value是一个map

【typeMap】key为对于这个属性的进行了哪种操作,value是一个Set

【depSet】存储了对于这个属性操作所有的依赖函数

### 实现Effect

这里直接给出 Effect 实现：

```javascript
/**
 * 用于记录当前活动的 effect
 */
export let activeEffect = undefined;
export const targetMap = new WeakMap(); // 用来存储对象和其属性的依赖关系
const effectStack = [];

/**
 * 该函数的作用，是执行传入的函数，并且在执行的过程中，收集依赖
 * @param {*} fn 要执行的函数
 */
export function effect(fn) {
  const environment = () => {
    try {
      activeEffect = environment;
      effectStack.push(environment);
      cleanup(environment);
      return fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  };
  environment.deps = [];
  environment();
}

export function cleanup(environment) {
  let deps = environment.deps; // 拿到当前环境函数的依赖（是个数组）
  if (deps.length) {
    deps.forEach((dep) => {
      dep.delete(environment);
    });
    deps.length = 0;
  }
}
```

### 改造track

之前 track 仅仅只是简单的打印，那么现在就不能是简单打印了，而是进行具体的依赖收集。

注意依赖收集的时候，需要按照上面的设计一层一层进行查找。

```javascript
import { targetMap, activeEffect } from './effect.js'
import { TrackOpTypes, ITERATE_KEY } from "../utils.js"

let shouldTrack = true
// 暂停收集依赖
export function pauseTracking() {
  shouldTrack = false
}
// 恢复收集依赖
export function resumeTracking() {
  shouldTrack = true
}

export default function(target, type, key) {
  if (!shouldTrack || !activeEffect) return

  // key归一化
  if (type === TrackOpTypes.ITERATE) {
    key = ITERATE_KEY
  }
  // 拿到propMap
  let propMap = targetMap.get(target);
  if (!propMap) {
    propMap = new Map();
    targetMap.set(target, propMap);
  }

  // 拿到typeMap
  let typeMap = propMap.get(key);
  if (!typeMap) {
    typeMap = new Map();
    propMap.set(key, typeMap);
  }

  // 最后一步，根据 type 值去找对应的 Set
  let depSet = typeMap.get(type);
  if (!depSet) {
    depSet = new Set();
    typeMap.set(type, depSet);
  }

  depSet.add(activeEffect)
  activeEffect.deps.push(depSet)
}
```

### 改造trigger

trigger 要做的事情也很简单，就是从我们所设计的数据结构里面，一层一层去找，找到对应的依赖函数集合，然后全部执行一次。

首先我们需要**建立一个设置行为和读取行为之间的映射关系**：

```javascript
// 定义修改数据和触发数据的映射关系
const triggerTypeMap = {
  [TriggerOpTypes.SET]: [TrackOpTypes.GET],
  [TriggerOpTypes.ADD]: [
    TrackOpTypes.GET,
    TrackOpTypes.ITERATE,
    TrackOpTypes.HAS,
  ],
  [TriggerOpTypes.DELETE]: [
    TrackOpTypes.GET,
    TrackOpTypes.ITERATE,
    TrackOpTypes.HAS,
  ],
};
```

我们前面在建立映射关系的时候，是根据具体的获取信息的行为来建立的映射关系，那么我们获取信息的行为有：

- GET
- HAS
- ITERATE

这些都是在获取成员信息，而依赖函数就是和这些获取信息的行为进行映射的。

因此在进行设置操作的时候，需要思考一下当前的设置，会涉及到哪些获取成员的行为，然后才能找出该行为所对应的依赖函数。

```javascript
import { TriggerOpTypes, TrackOpTypes, ITERATE_KEY} from '../utils.js'
import { targetMap, activeEffect } from './effect.js'


// 定义修改数据和触发数据的映射关系
const triggerTypeMap = {
  [TriggerOpTypes.SET]: [TrackOpTypes.GET],
  [TriggerOpTypes.ADD]: [
    TrackOpTypes.GET,
    TrackOpTypes.ITERATE,
    TrackOpTypes.HAS,
  ],
  [TriggerOpTypes.DELETE]: [
    TrackOpTypes.GET,
    TrackOpTypes.ITERATE,
    TrackOpTypes.HAS,
  ],
}

export default function(target, type, key) {
  const effectFns = getEffectFns(target, type, key)
  for(const effectFn of effectFns) {
    if (effectFn !== activeEffect) {
      effectFn()
    }
  }
}

function getEffectFns(target, type, key) {
  const propMap = targetMap.get(target)
  if (!propMap) return

  // 新增或者删除属性，会涉及到额外触发迭代
  const keys = [key]
  if (type === TriggerOpTypes.ADD || type === TriggerOpTypes.DELETE) {
    keys.push(ITERATE_KEY)
  }

  const effectFns = new Set()
  for(const key of keys) {
    const typeMap = propMap.get(key)
    if (!typeMap) continue

    const trackTypes = triggerTypeMap[type]
    for(const trackType of trackTypes) {
      const deps = typeMap.get(trackType)
      if (!deps) continue
      for(const effectFn of deps) {
        effectFns.add(effectFn)
      }
    }
  }
  return effectFns
}
```

### 懒执行

有些时候我们想要实现懒执行，也就是不想要传入 effect 的回调函数自动就执行一次，通过配置项来实现

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739339886141-a3020593-82f5-4b6b-887f-eba81a201232.png)

此时可以通过以下方式来手动去调用：

```javascript
const lazyFn = effect(() => {
  console.log('fn1')
  state.a
}, {lazy: true})


lazyFn()
```

需要注意的是，由于执行函数时才会去收集依赖，所以如果是以下情况会报错：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739339997856-8012ea14-ea3e-47a6-adec-a90f22dd763d.png)

这就是因为在执行函数前去修改了a，进行了派发更新，但是由于此时没有依赖所以会报错，加上如下判断即可：

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739340043231-4e5a014c-3bc8-42a8-a011-e558f6b7d562.png)

### 添加回调

有些时候需要由用户来指定是否派发更新，支持用户传入一个回调函数，然后将要依赖的函数作为参数传递回给用户给的回调函数，由用户来决定如何处理。

![img](https://cdn.nlark.com/yuque/0/2025/png/22253064/1739342678376-37f9b83c-d6c2-4a4d-a63b-dcf208da73e6.png)

```javascript
export default function(target, type, key) {
  const effectFns = getEffectFns(target, type, key)
  if (!effectFns) return
  for(const effectFn of effectFns) {
    if (effectFn !== activeEffect) {
      if (effectFn.options && effectFn.options.shcheduler) {
        effectFn.options.shcheduler(effectFn)
      } else {
        effectFn()
      }
    }
  }
}
```
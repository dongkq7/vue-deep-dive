let activeEffect = null
// 这里没有使用WeakMap是因为WeakMap无法遍历且WeakMap的key只能是对象
const depsMap = new Map()
const effectStack = []; // 保存函数栈
// 依赖收集
function track(target, key) {
  if (activeEffect) {
    let deps = depsMap.get(key)
    if (!deps) {
      deps = new Set()
      depsMap.set(key, deps)
    }
    deps.add(activeEffect)
    activeEffect.deps.push(deps)
    console.log('deps...', depsMap)
  }
}

// 派发更新
function trigger(target, key) {
  const deps = depsMap.get(key)
  if (deps) {
    const effectsToRun = new Set(deps)
    effectsToRun.forEach(effect => {
      if (effect !== activeEffect) {
        effect()
      }
    })
  }
}

const data = {
  a: 1,
  b: 2,
  c: 3
}

const state = new Proxy(data, {
  get(target, key) {
    track(target, key)
    return target[key]
  },
  set(target, key, value) {
    target[key] = value
    trigger(target, key)
    return true
  }
})


function effect(fn) {
  const environment = () => {
    activeEffect = environment
    effectStack.push(environment)
    // 清理依赖，保证每次收集的依赖都是最新的
    cleanup(environment)
    fn()
    // activeEffect = null
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }
  environment.deps = []
  environment()
}

function cleanup(environment) {
  const { deps } = environment
  if (deps.length) {
    deps.forEach(depSet => {
      depSet.delete(environment)
      if (depSet.size === 0) {
        for(let [key, value] of depsMap) {
          if (value === depSet) {
            depsMap.delete(key)
          }
        }
      }
    })
  }
  deps.length = 0
}

// effect(() => {
//   if (state.a === 1) {
//     state.b
//   } else {
//     state.c
//   }
//   console.log('执行了...')
// })
// state.a = 10

// effect(() => {
//   if (state.a === 1) {
//     state.b;
//   } else {
//     state.c;
//   }
//   console.log("执行了函数1");
// });
// effect(() => {
//   console.log(state.c);
//   console.log("执行了函数2");
// });
// state.a = 2;

// effect(() => {
//   if (state.a === 1) {
//     state.b
//   } else {
//     state.c
//   }
//   console.log("执行了函数1")
// });
// effect(() => {
//   console.log(state.a)
//   console.log(state.c)
//   console.log("执行了函数2")
// });
// state.a = 2

// effect(() => {
//   console.log('fn1')
//   state.a = state.a + 2
// })

// state.a = 2

effect(() => {
  effect(() => {
    state.a
    console.log("执行了函数2")
  })
  state.b
  console.log("执行了函数1")
})
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
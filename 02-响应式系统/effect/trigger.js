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
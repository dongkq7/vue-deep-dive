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
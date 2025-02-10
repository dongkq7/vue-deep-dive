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
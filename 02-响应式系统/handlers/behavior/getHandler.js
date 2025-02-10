import track, { pauseTracking, resumeTracking } from "../../effect/track.js"
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
});

['push', 'pop', 'shift', 'unshift'].forEach(method => {
  arrayInstrumentations[method] = function(...args) {
    pauseTracking()
    const res = Array.prototype[method].apply(this, args)
    resumeTracking()
    return res
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
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
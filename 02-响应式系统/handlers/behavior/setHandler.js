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
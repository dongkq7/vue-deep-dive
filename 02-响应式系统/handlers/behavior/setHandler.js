import trigger from "../../effect/trigger.js"
import { TriggerOpTypes, hasChanged} from "../../utils.js"


export default function(target, key, value) {
  // 由于新增属性也会触发set，所以需要进一步判断下是新增属性还是修改
  const type = target.hasOwnProperty(key) ? TriggerOpTypes.SET : TriggerOpTypes.ADD

  const oldValue = target[key]
  const result = Reflect.set(target, key, value)

  // 值改变了那么就进行派发更新
  if (hasChanged(oldValue, value)) {
    trigger(target, type, value)
  }
  return  result
}
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
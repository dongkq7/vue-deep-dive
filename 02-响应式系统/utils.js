export function isObject(target) {
  return typeof target === 'object' && target !== null
}

export function hasChanged(oldValue, newValue) {
  return !Object.is(oldValue, newValue)
}

/**
 * 收集依赖操作类型
 */
export const TrackOpTypes = {
  GET: 'get',
  HAS: 'has',
  ITERATE: 'iterate'
}

/**
 * 派发更新操作类型
 */
export const TriggerOpTypes = {
  SET: 'set',
  ADD: 'add',
  DELETE: 'delete'
}

// 特殊标识
export const RAW = Symbol('raw')
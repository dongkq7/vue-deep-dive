import { effect, cleanup } from "../02-响应式系统/effect/effect.js"

/**
 *
 * @param {*} source 响应式数据或者 getter 函数（数组的情况暂不考虑）
 * @param {*} cb 要执行的回调函数
 * @param {*} options 选项对象
 */
export function watch(source, cb, options = {}) {
  // 参数归一化
  let getter
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }
  // getter函数执行结果的新值与旧值
  let newValue, oldValue
  // 手动effectFn，其中执行getter函数，进行依赖收集
  // 依赖收集后，一旦响应式数据发生变化，就会重新执行getter函数，那么可以通过shcheduler来执行派发更新需要做的操作
  const effectFn = effect(getter, {
    lazy: true,
    shcheduler: () => {
      if (options.flush === 'post') {
        Promise.resolve().then(job)
      } else {
        job()
      }
    }
  })

  const job = () => {
    newValue = effectFn()
    cb(newValue, oldValue)
    oldValue = newValue
    if (options.once) {
      cleanup(effectFn)
    }
  }

  if(options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }

  return () => {
    cleanup(effectFn)
  }

}

/**
 * 该工具方法用于遍历对象的所有属性，包括嵌套对象的属性
 * 之所以要遍历，是为了触发这些属性的依赖收集
 * @param {*} value
 * @param {*} seen
 */
function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) {
    return value
  }
  seen.add(value)
  for(let key in value) {
    traverse(value[key], seen)
  }
  return value
}
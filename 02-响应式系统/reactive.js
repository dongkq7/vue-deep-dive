// 这是一个入口文件，会提供一个reactive API，该方法接收到一个对象，返回一个Proxy对象
import handlers from './handlers/index.js'
import { isObject } from './utils.js'

const proxyMap = new WeakMap()

export function reactive(target) {
  // 如果不是对象，直接返回
  if (!isObject(target)) {
    return target
  }
  // 判断是否已经代理过了，已经代理过就直接返回代理过的对象
  if (proxyMap.has(target)) {
    return proxyMap.get(target)
  }
  const proxy = new Proxy(target, handlers)
  // 保存一下原始对象与代理对象的映射
  proxyMap.set(target, proxy)
  return proxy
}
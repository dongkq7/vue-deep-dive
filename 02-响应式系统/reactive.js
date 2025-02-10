// 这是一个入口文件，会提供一个reactive API，该方法接收到一个对象，返回一个Proxy对象
import handlers from './handlers/index.js'

export function reactive(target) {
  const proxy = new Proxy(target, handlers)

  return proxy
}
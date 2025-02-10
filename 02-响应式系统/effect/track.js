export default function(target, type, key) {
  console.log(`收集器：代理对象${key}属性的${type}操作被拦截`)
}
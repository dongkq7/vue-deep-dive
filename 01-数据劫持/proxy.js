// const data = {
//   a: 1,
//   b: 2,
//   c: 3
// }

// const proxy = new Proxy(data, {
//   get(target, key) {
//     console.log('get...', key)
//     return target[key]
//   },
//   set(target, key, value) {
//     console.log('set...', key, value)
//     target[key] = value
//   }
// })

// proxy.a
// proxy.b
// proxy.a = 3
function isObject(target) {
  return typeof target === 'object' && target !== null
}
const data = {
  a: null,
  level1: {
    level2: {
      value: 100
    }
  }
}

function deepProxy(obj) {
  return new Proxy(obj, {
    get(target, key) {
      console.log(`读取了${key}属性`);
      const result = Reflect.get(target, key)
      if (isObject(result)) {
        return deepProxy(result)
      }
      return result
    },
    set(target,key,value) {
      console.log(`设置了${key}属性`)
      if (isObject(value)) {
        return deepProxy(value)
      }
      return Reflect.set(target, key, value)
    },
    has(target, key) {
      console.log(`判断是否存在${key}属性`)
      return Reflect.has(target, key)
    },
    deleteProperty(target, key) {
      console.log(`删除了${key}属性`)
      return Reflect.deleteProperty(target, key)
    },
    getPrototypeOf(target) {
      console.log("拦截获取原型")
      return Reflect.getPrototypeOf(target)
    },
    setPrototypeOf(target, proto) {
      console.log("拦截设置原型")
      return Reflect.setPrototypeOf(target, proto)
    },
    ownKeys(target) {
      console.log("拦截到了迭代操作")
      return Reflect.ownKeys(target)
    }
  })
}
const proxyData = deepProxy(data)

console.log(proxyData.level1.level2.value)
console.log("----------------")
proxyData.level1.level2.value = 200
console.log("----------------")
delete proxyData.a
console.log("----------------")
Object.getPrototypeOf(proxyData)
console.log("----------------")
Object.setPrototypeOf(proxyData, {})
console.log("----------------")
console.log('a' in proxyData)
console.log("----------------")
for(const key in proxyData) {}
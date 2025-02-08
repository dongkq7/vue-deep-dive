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
      if (typeof target[key] === 'object' && target[key] !== null) {
        return deepProxy(target[key])
      }
      return target[key]
    },
    set(target,key,value) {
      console.log(`设置了${key}属性`);
      if (typeof value === 'object' && value !== null) {
        return deepProxy(value)
      }
      target[key] = value
    },
    deleteProperty(target, key) {
      console.log(`删除了${key}属性`)
      delete target[key]
    },
    getPrototypeOf(target) {
      console.log("拦截获取原型")
      return Object.getPrototypeOf(target);
    },
    setPrototypeOf(target, proto) {
      console.log("拦截设置原型")
      return Object.setPrototypeOf(target, proto)
    },
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
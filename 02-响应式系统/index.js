import { reactive } from './reactive.js'

const obj = {
  a: 1,
  b: 2,
  c: {
    name: '123'
  }
}
// const proxyObj = reactive(obj)

// proxyObj.b = 3
// proxyObj.d = 5
// delete proxyObj.f
// delete proxyObj.a

// 'a' in proxyObj
// for(const key in proxyObj){}

const proxyArr = reactive([1, obj, 2])
// console.log('----------测试数组读取行为-----------')
// proxyArr[0]
// proxyArr.length
// for(let key in proxyArr) {
//   proxyArr[key]
// }
// for(let i = 0; i < proxyArr.length; i++) {
//   proxyArr[i]
// }
// console.log(proxyArr.includes(1))
// console.log(proxyArr.indexOf(1))
// console.log(proxyArr.lastIndexOf(1))
// console.log(proxyArr.includes(obj))

console.log('----------测试数组写入行为-----------')
// proxyArr[5] = 10
// proxyArr.length = 1
proxyArr.push(4)



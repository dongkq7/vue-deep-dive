import { reactive } from './reactive.js'
import { effect } from './effect/effect.js'

// const obj = {
//   a: 1,
//   b: 2,
//   c: {
//     name: '123'
//   }
// }
// // const proxyObj = reactive(obj)

// // proxyObj.b = 3
// // proxyObj.d = 5
// // delete proxyObj.f
// // delete proxyObj.a

// // 'a' in proxyObj
// // for(const key in proxyObj){}

// // const proxyArr = reactive([1, obj, 2])
// // console.log('----------测试数组读取行为-----------')
// // proxyArr[0]
// // proxyArr.length
// // for(let key in proxyArr) {
// //   proxyArr[key]
// // }
// // for(let i = 0; i < proxyArr.length; i++) {
// //   proxyArr[i]
// // }
// // console.log(proxyArr.includes(1))
// // console.log(proxyArr.indexOf(1))
// // console.log(proxyArr.lastIndexOf(1))
// // console.log(proxyArr.includes(obj))

// console.log('----------测试数组写入行为-----------')
// // proxyArr[5] = 10
// // proxyArr.length = 1
// // proxyArr.push(4)


const obj = {
  a: 1,
  b: 2
}
const state = reactive(obj)

// effect(() => {
//   console.log('fn1')
//   state.a
// })
// state.a = 2

// effect(() => {
//   console.log('fn1')
//   state.a = state.a + 2
// })

// state.a = 2

// effect(() => {
//   console.log('fn1')
//   if (state.a === 1) {
//     state.b
//   } else {
//     state.c
//   }
// })

// effect(() => {
//   console.log('fn2')
//   state.a
//   state.c
// })

// state.a = 2
// state.b = 3
// state.c = 5

// const lazyFn = effect(() => {
//   console.log('fn1')
//   state.a
// }, {lazy: true})

// lazyFn()

// effect(() => {
//   console.log('fn1')
//   state.a
// })
// state.a ++

let isRun = false
effect(() => {
  console.log('fn1')
  state.a
}, {
  shcheduler: (fn) => {
    if (!isRun) {
      isRun = true
      fn()
    }
  }
})
state.a ++
state.a ++
state.a ++
state.a ++
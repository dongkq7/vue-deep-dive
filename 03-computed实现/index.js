import { computed } from "./computed.js"
import { reactive } from "../02-响应式系统/reactive.js"
import { effect } from "../02-响应式系统/effect/effect.js"


const state = reactive({
  a: 1,
  b: 2
})

const result = computed(() => {
  console.log('执行了...')
  return state.a + state.b
})

// console.log(result.value)
// console.log(result.value)
// console.log(result.value)
// console.log(result.value)

// state.a = 2
// console.log(result.value)

effect(() => {
  console.log('render', result.value)
})

state.a++
console.log(result.value)
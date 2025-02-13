import { reactive } from "../02-响应式系统/reactive.js"
import { watch } from "./watch.js"

const state = reactive({
  a: 1,
  b: 2
})

const unwatch = watch(() => state.a + state.b, (newValue, oldValue) => {
  console.log(newValue, oldValue)
}, {
  once: true,
  immediate: true
})
setTimeout(() => {
  state.a = 2
  // unwatch()
}, 1000)

setTimeout(() => {
  state.b = 3
}, 2000)
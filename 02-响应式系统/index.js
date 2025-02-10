import { reactive } from './reactive.js'

const obj = {
  a: 1,
  b: 2,
  c: {
    name: '123'
  }
}
const proxyObj = reactive(obj)

proxyObj.b = 3
proxyObj.d = 5
delete proxyObj.f
delete proxyObj.a

'a' in proxyObj
for(const key in proxyObj){}
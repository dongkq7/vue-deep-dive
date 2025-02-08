/**
 * 基本用法
 */
// const data = {
//   a: 1,
//   b: 2,
//   c: 3
// }

// Object.defineProperty(data, 'd', {
//   value: 4,
//   writable: true,
//   enumerable: true,
//   configurable: true // 设置为false后，不能再修改属性的特性，也不能删除属性
// })
// data.d = 5
// data.d = '00'
// delete data.d
// console.log(typeof data.d)
// for(const key in data) {
//   console.log(data[key])
// }

// 2

// function Student() {
//   let _name = '张三'
//   Object.defineProperty(this, 'name', {
//     get() {
//       console.log('get name...')
//       return _name
//     },
//     set(value) {
//       if (value !== _name && isNaN(value)) {
//         console.log('set name...', value)
//         _name = value
//       }
//     }
//   })
// }

// const student = new Student()
// console.log(student.name)
// student.name = '李四'
// student.name = 123
// console.log(student.name)


const data = {
  a: null,
  level1: {
    level2: {
      value: 100
    }
  }
}


function deepDefineProperty(obj) {
  console.log('obj...', obj)
  for(const key in obj) {
    if (obj.hasOwnProperty(key) && typeof obj[key] === 'object' && obj[key] !== null) {
      deepDefineProperty(obj[key])
    }
    let _value = obj[key]
    Object.defineProperty(obj, key, {
      get() {
        console.log('get..', key)
        return _value
      },
      set(value) {
        if (value !== _value) {
          console.log('set..', key)
          _value = value
        }
      }
    })
  }
}

deepDefineProperty(data)
data.a
data.a = 2
data.level1.level2
data.level1.level2 = 300

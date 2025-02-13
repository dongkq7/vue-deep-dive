import { defineComponent, h, ref } from "vue"
import styles from './CardComponent.module.css'

export default defineComponent({
  name: 'CardComponent',
  setup(_, {slots}) {
    const defaultSlotsVNode = slots.default()
    const title = ref('子组件传递的标题')

    let headerSlotsVNode = null
    // 如果传递了header插槽那么就调用
    if (slots.header) {
      // 作用域插槽的本质就是子组件在调用父组件传递的函数的时候传递参数过去
      headerSlotsVNode = slots.header({
        title: title.value
      })
    }
    // 没有传递header插槽，以及传递了但是其中没有内容都要使用默认内容
    if (!headerSlotsVNode) {
      headerSlotsVNode = h('div', null, '默认标题')
    }

    return () => {
      return h('div', {class: styles.card}, [
        h('div', {class: styles['card-header']}, headerSlotsVNode),
        h('div', {class: styles['card-body']}, defaultSlotsVNode)
      ])
    }
  }
})
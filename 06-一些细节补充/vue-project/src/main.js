import { createApp, reactive } from 'vue'
import App from './App.vue'
import { time } from './utils'

// 创建全局配置对象
const globalConfig = reactive({
  themeColor: 'red',
  userInfo: {
    name: '张三',
    age: 18
  }
})

function changeThemeColor(color) {
  globalConfig.themeColor = color
}

const app = createApp(App)

// provide
app.provide('globalConfig', globalConfig)
app.provide('changeThemeColor', changeThemeColor)

// 注册全局指令
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// 加入这是用户的权限信息
const userPermission = ['delete', 'admin']

app.directive('permission', {
  mounted(el, binding) {
    const permissions = binding.value
    if (permissions && permissions instanceof Array) {
      const hasPermission = permissions.some(p => userPermission.includes(p))
      if (!hasPermission) {
        el.style.display = 'none'
      }
    } else {
      throw new Error('请传入一个权限数组')
    }
  }
})

app.directive('time', {
  mounted(el, binding) {
    const { value } = binding
    el.innerHTML = time.getFormatTime(value)
    // 创建一个计时器去实时更新提示信息
    el.timeout = setInterval(() => {
      el.innerHTML = time.getFormatTime(value)
    }, 60000)
  },
  unmounted(el) {
    clearInterval(el.timeout)
    delete el.timeout
  }
})
app.mount('#app')

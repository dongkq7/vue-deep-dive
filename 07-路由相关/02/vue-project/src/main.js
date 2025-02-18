import { createApp } from 'vue'
import App from './App.vue'
import router, { setRoutesbyRole } from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
// 引入图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 从本地读取角色
const userRole = localStorage.getItem('userRole')

if (userRole) {
  setRoutesbyRole(userRole)
}

app.use(ElementPlus)
app.use(router)
app.provide('global', {
  color: 'red'
})
app.mount('#app')

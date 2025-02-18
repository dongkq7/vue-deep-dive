import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { logPlugin } from './plugins/logPlugin.js'

const app = createApp(App)
// 创建并配置Pinia
const pinia = createPinia()
pinia.use(logPlugin)

app.use(pinia)

app.mount('#app')

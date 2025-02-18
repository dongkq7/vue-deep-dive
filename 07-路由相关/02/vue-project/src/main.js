import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.provide('global', {
  color: 'red'
})
app.mount('#app')

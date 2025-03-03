import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ObserveVisibility } from 'vue3-observe-visibility'

import App from './App.vue'
import router from './router'

const app = createApp(App)
// 注册
app.directive('observe-visibility', ObserveVisibility)

app.use(createPinia())
app.use(router)

app.mount('#app')

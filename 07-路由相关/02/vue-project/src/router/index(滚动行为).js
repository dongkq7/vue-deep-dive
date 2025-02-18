import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/04/Home.vue'
import About from '../views/04/About.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: About },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // return { top: 0, behavior: 'smooth'}
    // return new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     resolve({ left: 0, top: 0, behavior: 'smooth' })
    //   }, 500)
    // })

    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }  else if (savedPosition) {
      return { ...savedPosition, behavior: 'smooth' }
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

export default router

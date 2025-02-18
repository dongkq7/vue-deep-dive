import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/03/Home.vue'

import User from '../views/03/User.vue'
import Admin from '../views/03/Admin.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/user/:id', name: 'user', component: User, meta: { transition: 'silde-left' } },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { transition: 'silde-right' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

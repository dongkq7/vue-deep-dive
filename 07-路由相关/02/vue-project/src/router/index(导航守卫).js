import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import About from '../views/AboutView.vue'
import User from '@/views/UserView.vue'
import { inject } from 'vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    // 路由级别守卫
    beforeEnter: (to, from ,next) => {
      console.log('路由级别守卫，即将进入Home页面')
      next()
    }
  },
  {
    path: '/about',
    name: 'about',
    component: About,
    // 路由级别守卫
    beforeEnter: (to, from ,next) => {
      console.log('路由级别守卫，即将进入About页面')
      next()
    }
  },
  {
    path: '/user/:userId',
    name: 'user',
    component: User,
    props: true,
    // 路由级别守卫
    beforeEnter: (to, from ,next) => {
      console.log('路由级别守卫，即将进入User页面')
      next()
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
// router.beforeEach((to, from, next) => {
//   console.log('to=>', to)
//   console.log('from=>', from)
//   console.log('导航到=>', to.name)
//   next()
// })

// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('全局前置守卫，即将进入页面')
  const globalData = inject('global')
  console.log('globalData..', globalData)
  next()
})

// 全局解析守卫
router.beforeResolve((to, from, next) => {
  console.log('全局解析守卫，即将解析页面')

  next()
})

// 全局后置钩子
router.afterEach(() => {
  console.log('全局后置钩子，页面已解析')
})

export default router

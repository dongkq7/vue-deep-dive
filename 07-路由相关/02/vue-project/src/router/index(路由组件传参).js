import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LeftSideBar from '@/components/LeftSideBar.vue'
import RightSideBar from '@/components/RightSideBar.vue'


const routes = [
  {
    path: '/home',
    redirect: '/'
  },
  {
    path: '/',
    name: 'home',
    components: {
      default: HomeView,
      left: LeftSideBar,
      right: RightSideBar
    },
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (About.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/AboutView.vue'),
  },
  // {
  //   path: '/user/:id',
  //   name: 'user',
  //   alias: '/profile/:id',
  //   component: () => import('../views/UserView.vue')
  // }
  {
    path: '/user/:id',
    name: 'user',
    redirect: (to) => ({ name: 'profile', params: {userId: to.params.id}})
  },
  {
    path: '/profile/:userId',
    name: 'profile',
    component: () => import('../views/UserView.vue'),
    props: true
  },
  {
    path: '/product/:name+',
    name: 'product',
    component: () => import('../views/ProductView.vue'),
    sensitive: true,
    strict: true,
    props: {
      new: true
    }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../views/SearchView.vue'),
    props: (route) => ({query: route.query.q})
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DebounceRef from '../views/DebounceRef.vue'
import LazyLoad from '../views/LazyLoad.vue'
import InfinityList from '@/views/InfinityList.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/debounceRef',
      name: 'home',
      component: DebounceRef,
    },
    {
      path: '/lazyLoad',
      name: 'lazyLoad',
      component: LazyLoad
    }
  ],
})

export default router

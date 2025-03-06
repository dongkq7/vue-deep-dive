import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/tree',
      name: 'Tree',
      component: () => import('@/views/Tree.vue'),
      meta: {
        page: '树形组件封装'
      }
    },
    {
      path: '/debounceRef',
      name: 'deBounceRef',
      component: () => import('@/views/DebounceRef.vue'),
      meta: {
        page: '使用custormRef实现防抖ref'
      }
    },
    {
      path: '/lazyLoad',
      name: 'lazyLoad',
      component: () => import('@/views/LazyLoad.vue'),
      meta: {
        page: '懒加载'
      }
    },
    {
      path: '/infinityList',
      name: 'infinityList',
      component: () => import('@/views/InfinityList.vue'),
      meta: {
        page: '虚拟列表-元素定高'
      }
    },
    {
      path: '/infinityList2',
      name: 'infinityList2',
      component: () => import('@/views/InfinityList2.vue'),
      meta: {
        page: '虚拟列表-元素不定高'
      }
    },
    {
      path: '/vueuse',
      name: 'vueuse',
      component: () => import('@/views/Vueuse.vue'),
      meta: {
        page: 'VueUse使用示例'
      }
    },
    {
      path: '/drag',
      name: 'drag',
      component: () => import('@/views/VueDraggable.vue'),
      meta: {
        page: 'VueDraggable使用示例'
      }
    },
    {
      path: '/resize',
      name: 'resize',
      component: () => import('@/views/VueDragResize1.vue'),
      meta: {
        page: 'VueDragResize使用示例1'
      }
    },
    {
      path: '/resize2',
      name: 'resize2',
      component: () => import('@/views/VueDragResize2.vue'),
      meta: {
        page: 'VueDragResize使用示例2'
      }
    },
    {
      path: '/chart',
      name: 'vue-chartjs',
      component: () => import('@/views/VueCartjs.vue'),
      meta: {
        page: 'VueChartjs使用示例'
      }
    },
    {
      path: '/vuelidate',
      name: 'vuelidate1',
      component: () => import('@/views/Vuelidate1.vue'),
      meta: {
        page: 'Vuelidate使用示例1'
      }
    },
    {
      path: '/vuelidate2',
      name: 'vuelidate2',
      component: () => import('@/views/Vuelidate2.vue'),
      meta: {
        page: 'Vuelidate使用示例2'
      }
    }
  ],
})

export default router

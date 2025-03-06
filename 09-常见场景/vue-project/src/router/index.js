import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import Tree from '@/views/Tree.vue'
import DebounceRef from '@/views/DebounceRef.vue'
import LazyLoad from '@/views/LazyLoad.vue'
import InfinityList from '@/views/InfinityList.vue'
import InfinityList2 from '@/views/InfinityList2.vue'
import Vueuse from '@/views/Vueuse.vue'
import VueDraggable from '@/views/VueDraggable.vue'
import VueDragResize1 from '@/views/VueDragResize1.vue'
import VueDragResize2 from '@/views/VueDragResize2.vue'


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
      component: Tree,
    },
    {
      path: '/debounceRef',
      name: 'deBounceRef',
      component: DebounceRef,
    },
    {
      path: '/lazyLoad',
      name: 'lazyLoad',
      component: LazyLoad
    },
    {
      path: '/infinityList',
      name: 'infinityList',
      component: InfinityList
    },
    {
      path: '/infinityList2',
      name: 'infinityList2',
      component: InfinityList2
    },
    {
      path: '/vueuse',
      name: 'vueuse',
      component: Vueuse
    },
    {
      path: '/drag',
      name: 'drag',
      component: VueDraggable
    },
    {
      path: '/resize',
      name: 'resize',
      component: VueDragResize1
    },
    {
      path: '/resize2',
      name: 'resize2',
      component: VueDragResize2
    }
  ],
})

export default router

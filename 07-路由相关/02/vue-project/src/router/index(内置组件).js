import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/02/Home.vue'


const routes = [
  { path: '/', component: Home},
  {
    path: '/about',
    component: () => import('../views/02/About.vue'),
    children: [
      {
        path: 'team',
        component: () => import('../views/02/Team.vue')
      },
      {
        path: 'projects',
        component: () => import('../views/02/Projects.vue'),
        children: [
          {
            path: ':id',
            component: () => import('../views/02/ProjectDetails.vue'),
            props: true
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/new',
      name: 'new',
      component: () => import('../views/AddNew.vue')
    },
    {
      path: '/edit/:id',
      name: 'edit',
      component: () => import('../views/Edit.vue')
    },
    {
      path: '/details/:id',
      name: 'details',
      component: () => import('../views/Details.vue')
    },
    // {
    //   path: '/search',
    //   name: 'search',
    //   component: () => import('../views/Search.vue')
    // },
    {
      path: '/translate',
      name: 'translate',
      component: () => import('../views/Translate.vue')
    }
  ]
})

export default router

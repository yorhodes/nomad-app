import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Bridge from '@/views/Bridge/Bridge.main.vue'
import Transaction from '@/views/Transaction/Transaction.main.vue'
import Unavailable from '@/views/Unavailable.vue'
import PageNotFound from '@/views/PageNotFound.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Bridge',
    component: Bridge,
  },
  {
    path: '/transaction/:network/:id',
    name: 'Transaction',
    component: Transaction,
  },
  {
    path: '/unavailable',
    name: 'Unavailable',
    component: Unavailable,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: PageNotFound,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router

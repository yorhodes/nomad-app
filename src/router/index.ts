import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Bridge from '@/views/Bridge/Bridge.main.vue'
import Transaction from '@/views/Transaction.vue'
import NomadTransaction from '@/views/Transaction/Transaction.main.vue'
import PageNotFound from '@/views/PageNotFound.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Bridge',
    component: Bridge,
  },
  {
    path: '/tx',
    name: 'Transaction',
    component: Transaction,
  },
  {
    path: '/tx/nomad/:network/:id',
    name: 'NomadTransaction',
    component: NomadTransaction,
  },
  {
    path: '/tx/connext/:id',
    name: 'ConnextTransaction',
    component: Transaction,
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

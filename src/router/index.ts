import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Bridge from '@/views/Bridge/Bridge.main.vue'
import TransactionSearch from '@/views/TransactionSearch.vue'
import NomadTransaction from '@/views/Transaction/Nomad/Main.vue'
import ConnextTransaction from '@/views/Transaction/Connext/Main.vue'
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
    component: TransactionSearch,
  },
  {
    path: '/tx/nomad/:network/:id',
    name: 'NomadTransaction',
    component: NomadTransaction,
  },
  {
    path: '/tx/connext/:id',
    name: 'ConnextTransaction',
    component: ConnextTransaction,
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

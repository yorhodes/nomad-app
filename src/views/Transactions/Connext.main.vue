<template>
  <div v-if="active.length" class="active-txs">
    <div class="flex flex-row items-center p-2 justify-between">
      <n-text class="uppercase text-lg font-semibold">Active Transactions</n-text>
      <n-text class="opacity-70 text-lg">{{ active.length}}</n-text>
    </div>
    <n-data-table
      :bordered="false"
      :columns="columns"
      :data="active"
      :pagination="pagination"
      row-class-name="table"
    />
  </div>
</template>

<script lang="ts">
import { h, defineComponent } from 'vue'
import { ActiveTransaction } from '@connext/nxtp-sdk'
import { NDataTable, NText } from 'naive-ui'

import { useStore } from '@/store'
import TransactionMain from './columns/transaction.vue'
import Networks from './columns/networks.vue'
import Actions from './columns/actions.vue'
// import Amount from './columns/amount.vue'

const createColumns = ({ claim }: any) => {
  return [
    {
      title: 'Transaction',
      key: 'transaction',
      render (tx: any) {
        return h(
          TransactionMain,
          {
            status: tx.status,
            hash: tx.key,
            expired: tx.expired,
          }
        )
      }
    },
    {
      title: 'Networks',
      key: 'networks',
      render (tx: any) {
        return h(
          Networks,
          {
            originChainId: tx.sendingChain,
            destinationChainId: tx.receivingChain,
          }
        )
      }
    },
    // {
    //   title: 'Amount',
    //   key: 'amount',
    //   render (tx: any) {
    //     return h(
    //       Amount,
    //     )
    //   }
    // },
    {
      title: 'Status',
      key: 'status',
      render (tx: any) {
        return h(
          Actions,
          {
            status: tx.status,
            expired: tx.expired,
            onClick: () => claim(tx.action)
          },
        )
      }
    },
  ]
}

export default defineComponent({
  components: {
    NDataTable,
    NText,
  },

  data() {
    return {
      active: [],
      pagination: {
        pageSize: 5
      }
    }
  },

  setup: () => {
    const store = useStore()
    return {
      store,
      columns: createColumns({
        claim (tx: ActiveTransaction) {
          store.dispatch('finishTransfer', tx)
        }
      }),
    }
  },

  async mounted() {
    // await this.store.getters.getTransaction()
    this.active = await this.store.getters.getActiveConnextTxs()
    console.log(this.active)
  },
})
</script>

<style scoped lang="stylus">
.active-txs
  margin-top 100px
</style>

<template>
  <div v-if="active.length" class="container">
    <div class="text-right mb-3 uppercase">Active Connext Transactions</div>
    <n-card
      v-for="tx in active"
      :key="tx.key"
      style="backgroundColor: #272829;"
      :bordered="false"
      class="mb-2 rounded-xl"
    >
      <div class="flex flex-row justify-between mb-4">
        Transaction:
        <copy-hash v-if="tx.key" :address="tx.key" />
      </div>
      <!-- <div class="flex flex-row justify-between">
        Amount:
        {{ tx.sentAmount }}
      </div> -->
      <div v-if="tx.status === 'ReceiverTransactionPrepared'">
        <nomad-button primary class="w-full text-center justify-center" @click="claim(tx.key)">Claim</nomad-button>
      </div>
      <div v-else>Waiting for router</div>
    </n-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useStore } from '@/store'
import { NCard } from 'naive-ui'
import CopyHash from '@/components/CopyHash.vue'
import NomadButton from '@/components/Button.vue'

export default defineComponent({
  components: {
    NCard,
    CopyHash,
    NomadButton,
  },

  data() {
    return {
      active: []
    }
  },

  setup: () => {
    const store = useStore()
    return { store }
  },

  async mounted() {
    this.active = await this.store.getters.getActiveConnextTxs()
    console.log(this.active)
  },

  methods: {
    claim(txHash: string) {
      this.$router.push(`/tx/connext/${txHash}`)
    }
  }
})
</script>

<style scoped lang="stylus">
.container
  position absolute
  top 0
  right 0
  max-height 100%
  width 250px
  overflow scroll
  margin 10px 20px

.text-right
  text-align right
</style>

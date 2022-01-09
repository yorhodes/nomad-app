<template>
  <div v-if="active.length" class="container fade-in">
    <div class="text-center mb-3 uppercase">Active Connext Transactions</div>
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
    await this.store.getters.getTransaction('0xf755d22b15a65e2d77d892d0153fae118303483e62e32e1ad9c593bf20a1327b')
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
</style>

<template>
  <div class="flex flex-row justify-between mt-4">
    Fees:
    <div v-if="!fee" class="flex flex-row">
      <div class="mr-2">Calculating</div>
      <loader-spin />
    </div>
    <div v-else>{{ fee.toString() }} {{ token }}</div>
  </div>

  <div class="flex flex-row justify-between mt-2">
    Estimated Received:
    <div class="flex flex-row">
      <div v-if="total">{{ toal.toString() }}</div>
      <loader-bounce v-else/>
      <div>{{ token.symbol }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useStore } from '@/store'
import { utils } from 'ethers'

import LoaderSpin from '@/components/LoaderDots.vue'
import LoaderBounce from '@/components/LoaderBounce.vue'

export default defineComponent({
  components: {
    LoaderSpin,
    LoaderBounce,
  },

  setup() {
    const store = useStore()

    return {
      fee: computed(() => {
        return store.state.connext.fee ? utils.formatUnits(store.state.connext.fee.toString(), 18) : undefined
      }),
      prepared: computed(() => store.state.connext.prepared),
      token: computed(() => store.state.userInput.token),
      amount: computed(() => store.state.userInput.sendAmount),
      total: computed(() => {
        const { fee } = store.state.connext
        const { sendAmount, token } = store.state.userInput
        if (!fee || !sendAmount) return
        const amountBN = utils.parseUnits(sendAmount.toString(), token.decimals)
        return amountBN.add(fee)
      }),
      store,
    }
  },

  methods: {
    async prepareTransfer() {
      await this.store.dispatch('prepareTransfer')
      this.$router.push(`/connext-transaction/${this.prepared.txData.transactionId}`)
    },
  },
})
</script>

<template>
  <n-modal :show="!!fee" class="bg-card" @maskClick="$emit('hide')">
    <n-card class="w-11/12 max-w-xs">
      <!-- header -->
      <div class="mb-5">
        <n-text class="block">Swap using Connext</n-text>
      </div>

      <div>Fee: {{ fee.toString() }}</div>

      <n-button
        color="#fff"
        text-color="#000"
        class="w-full mt-3 uppercase"
        @click="prepareTransfer"
      >
        Swap Tokens
      </n-button>
      <!-- TODO: support secondary nomad-button and use here -->
      <n-button
        color="#3B3B3B"
        text-color="#fff"
        class="w-full mt-3 uppercase"
        @click="$emit('hide')"
      >
        Cancel
      </n-button>
    </n-card>
  </n-modal>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { NModal, NCard, NText, NButton } from 'naive-ui'
import { useStore } from '@/store'
import { utils } from 'ethers'

export default defineComponent({
  components: {
    NModal,
    NCard,
    NText,
    NButton,
  },

  setup() {
    const store = useStore()

    return {
      fee: computed(() => {
        return store.state.connext.fee ? utils.formatUnits(store.state.connext.fee.toString(), 18) : undefined
      }),
      prepared: computed(() => store.state.connext.prepared),
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

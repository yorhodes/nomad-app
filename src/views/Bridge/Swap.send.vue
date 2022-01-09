<template>
  <!-- ETA -->
  <div class="flex flex-row justify-between">
    <n-text class="opacity-50">Est. time to delivery</n-text>
    <n-text>Less than 10 minutes</n-text>
  </div>

  <n-divider />

  <!-- Connext -->
  <div class="flex flex-row items-center">
    <img src="@/assets/icons/connext.svg" class="h-9 mr-2" />
    <div class="flex flex-col">
      <n-text>Good news! Your transfer will be filled by Connext.</n-text>
      <n-text class="opacity-50">
        Connext will swap tokens for an ultra-fast cross-chain transfer.
        <a
          href="https://docs.connext.network/Integration/SystemOverview/howitworks"
          target="_blank"
          class="text-white hover:underline"
        >
          Learn more
        </a>
      </n-text>
    </div>
  </div>

  <bridge-quote v-if="quoteInitiated" />

  <nomad-button
    v-if="!quote"
    class="w-full uppercase mt-6 bg-white text-black h-11 flex justify-center"
    @click="quoteSwap"
  >
    Quote Swap
  </nomad-button>

  <nomad-button
    v-else
    class="w-full uppercase mt-6 bg-white text-black h-11 flex justify-center"
    @click="swap"
  >
    Swap Tokens
  </nomad-button>

  <p class="opacity-50 text-center mt-3">
    You will continue to Metamask to approve transfer
  </p>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { NText, NDivider, useNotification } from 'naive-ui'
import { useStore } from '@/store'
import NomadButton from '@/components/Button.vue'
import BridgeQuote from './Bridge.quote.vue'

export default defineComponent({
  components: {
    NText,
    NDivider,
    NomadButton,
    BridgeQuote,
  },
  data () {
    return {
      quoteInitiated: false,
    }
  },
  setup: () => {
    const store = useStore()
    const notification = useNotification()

    return {
      userInput: computed(() => store.state.userInput),
      quote: computed(() => store.state.connext.quote),
      notification,
      store,
    }
  },

  methods: {
    // use connext to swap tokens
    async quoteSwap() {
      // TODO: validate inputs
      this.quoteInitiated = true
      // instantiate connext
      await this.store.dispatch('instantiateConnext')

      // format data
      // TODO: pass in amount as BN
      const swapData = {
        origin: this.userInput.originNetwork,
        destination: this.userInput.destinationNetwork,
        destinationAddress: this.userInput.destinationAddress,
        token: this.userInput.token,
        amount: this.userInput.sendAmount,
      }
      // get transfer quote
      await this.store.dispatch('getTransferQuote', swapData)
    },
    async swap() {
      console.log('swap')
    }
  },
})
</script>
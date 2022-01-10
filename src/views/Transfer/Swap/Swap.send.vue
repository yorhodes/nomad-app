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
      <n-text>Your transfer will be filled by Connext.</n-text>
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
    v-if="!quoteInitiated"
    class="w-full uppercase mt-6 bg-white text-black h-11 flex justify-center"
    @click="quoteSwap"
  >
    Quote Swap
  </nomad-button>

  <nomad-button
    v-else
    class="w-full uppercase mt-6 bg-white text-black h-11 flex justify-center disabled:opacity-30"
    @disabled="!quote"
    @click="swap"
  >
    Swap Tokens
  </nomad-button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { NText, NDivider, useNotification } from 'naive-ui'
import { useStore } from '@/store'
import NomadButton from '@/components/Button.vue'
import BridgeQuote from './Swap.quote.vue'

export default defineComponent({
  components: {
    NText,
    NDivider,
    NomadButton,
    BridgeQuote,
  },
  props: {
    v$: {
      type: Object,
      required: true,
    },
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
    // TODO: watch userInput and clear quote if anything changes
    async quoteSwap() {
      // validate inputs, return if invalid
      const inputsValid = await this.v$.$validate()
      if (!inputsValid) return

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
      await this.store.dispatch('prepareTransfer')
    }
  },

  computed: {
    sendAmount() {
      return this.userInput.sendAmount;
    }
  },

  watch: {
    async sendAmount(newAmt) {
      console.log('send amount changed!', newAmt);
      // user should initiate the quote first by clicking quote swap first
      if (!this.quoteInitiated) {
        return
      }

      if (!newAmt) {
        // reset and show user the quote swap button again
        await this.store.dispatch('resetTransferQuote')
        this.quoteInitiated = false
      }

      // reset and fetch new quote
      await this.store.dispatch('resetTransferQuote')
      await this.quoteSwap()
    }
  },
})
</script>
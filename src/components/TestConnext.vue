<template>
  <div class="flex flex-row mb-5">
    <nomad-button class="bg-white text-black" @click="swapTokens">Send</nomad-button>
    <div class="p-2" />
    <nomad-button class="bg-white text-black" @click="mintTokens">Mint TEST tokens</nomad-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { NxtpSdkEvents } from '@connext/nxtp-sdk'
import { utils } from 'ethers'

import { useStore } from '@/store'
import instantiateConnextSDK, { mintTestERC20 } from '@/utils/connext'
import NomadButton from '@/components/Button.vue'

export default defineComponent({
  components: {
    NomadButton,
  },
  setup() {
    const store = useStore()

    return {
      destinationAddress: computed(() => store.state.userInput.destinationAddress),
    }
  },
  methods: {
    async swapTokens() {
      console.log('swap using Connext')

      // get sdk
      const sdk = await instantiateConnextSDK()

      sdk.attach(NxtpSdkEvents.SenderTransactionPrepared, (data) => {
        console.log("!!SenderTransactionPrepared:", data)
      })

      sdk.attach(NxtpSdkEvents.SenderTransactionFulfilled, (data) => {
        console.log("!!SenderTransactionFulfilled:", data)
      })

      sdk.attach(NxtpSdkEvents.SenderTransactionCancelled, (data) => {
        console.log("!!SenderTransactionCancelled:", data)
      })

      sdk.attach(NxtpSdkEvents.ReceiverTransactionPrepared, (data) => {
        console.log("!!ReceiverTransactionPrepared:", data)
      })

      sdk.attach(NxtpSdkEvents.ReceiverTransactionFulfilled, async (data) => {
        console.log("!!ReceiverTransactionFulfilled:", data)
      })

      sdk.attach(NxtpSdkEvents.ReceiverTransactionCancelled, (data) => {
        console.log("!!ReceiverTransactionCancelled:", data)
      })

      sdk.attach(NxtpSdkEvents.SenderTokenApprovalMined, (data) => {
        console.log("!!SenderTokenApprovalMined:", data)
      })

      sdk.attach(NxtpSdkEvents.SenderTransactionPrepareSubmitted, (data) => {
        console.log("!!SenderTransactionPrepareSubmitted:", data)
      })

      // get quote
      // const amount = utils.parseUnits(sendAmount.toString(), token.decimals)
      const amount = utils.parseUnits('10', 18)
      // TODO: fill from user input, using test tokens
      const payload = {
        sendingChainId: 4,
        sendingAssetId: '0x82800cFeBC6bE8D65F69deA383B227e16cf70791',
        receivingChainId: 5,
        receivingAssetId: '0xcfDAD1B98bc62DACca93A92286479C997034337E',
        receivingAddress: this.destinationAddress,
        amount: amount.toString(),
      }
      console.log(payload)
      const quote = await sdk.getTransferQuote(payload)
      console.log('quote', quote)

      // estimate fee
      const feeEstimate = amount.sub(quote.bid.amountReceived)
      console.log('fee', feeEstimate)

      // prepare transfer
      const transfer = await sdk.prepareTransfer(quote)

      // wait for receiver prepared event
      const prepared = await sdk.waitFor(
        NxtpSdkEvents.ReceiverTransactionPrepared,
        100_000,
        (data) => data.txData.transactionId === transfer.transactionId // filter function
      )
      console.log('prepared', prepared)

      await sdk.fulfillTransfer(prepared)
      // done!
      console.log('DONE!!!')
    },
    async mintTokens() {
      await mintTestERC20(this.destinationAddress)
    }
  }
})
</script>

<template>
  <!-- BRIDGE TOKENS card -->
  <div class="max-w-xl relative">
    <!-- color blur section -->
    <div class="bridge pt-8 pb-28 px-5 relative">
      <bg-blur class="absolute inset-0 w-full h-full z-negative" />
      <h2 class="uppercase text-center mb-7">Bridge tokens</h2>
      <bridge-amount ref="bridgeAmount" />
    </div>

    <!-- bridge inputs overlay -->
    <div class="bridge-inputs-container absolute w-full">
      <bridge-inputs class="bridge-inputs mx-8" />
    </div>

    <!-- bottom drawer -->
    <div class="drawer pt-24 pb-5 px-8">
      <bridge-pending v-if="sending" />
      <bridge-send v-else :connext-avail="connextAvail" @send="send" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { utils } from 'ethers'
import { useVuelidate } from '@vuelidate/core'
import { NxtpSdkEvents } from '@connext/nxtp-sdk'

import { useStore } from '@/store'
import { networks } from '@/config'
import instantiateConnextSDK from '@/utils/connext'
import { isNativeToken, getNetworkDomainIDByName, checkConnext } from '@/utils'

import { useNotification } from 'naive-ui'

import BridgeAmount from './Bridge.amount.vue'
import BridgeInputs from './Bridge.inputs.vue'
import BridgeSend from './Bridge.send.vue'
import BridgePending from './Bridge.pending.vue'
import BgBlur from './Bridge.bgblur.vue'

export default defineComponent({
  components: {
    BridgeAmount,
    BgBlur,
    BridgeInputs,
    BridgeSend,
    BridgePending,
  },

  setup: () => {
    const store = useStore()
    const notification = useNotification()
    // contains validation scope, collects validations from children components but does not emit up to parent
    const v$ = useVuelidate({
      $scope: 'bridge',
      $stopPropagation: true,
    })

    return {
      userInput: computed(() => store.state.userInput),
      originAddress: computed(() => store.state.wallet.address),
      balance: computed(() => store.state.sdk.balance),
      sending: computed(() => store.state.sdk.sending),
      connextAvail: computed(() => {
        // if connext is disabled, return false
        if (store.state.userInput.disableConnext) return false
        // check config for available pairs
        const { token, destinationNetwork } = store.state.userInput
        return checkConnext(destinationNetwork, token.symbol)
      }),
      notification,
      store,
      v$,
    }
  },

  methods: {
    // use connext if available
    send() {
      this.connextAvail ? this.swapTokens() : this.bridgeTokens()
    },
    // use connext to swap tokens
    async swapTokens() {
      console.log('swap using Connext')

      // get sdk
      const sdk = await instantiateConnextSDK()

      // get quote
      const { destinationAddress } = this.userInput
      // const amount = utils.parseUnits(sendAmount.toString(), token.decimals)
      const amount = utils.parseUnits('10', 18)
      // TODO: fill from user input, using test tokens
      const payload = {
        // kovan
        sendingChainId: 42,
        sendingAssetId: '0xe71678794fff8846bff855f716b0ce9d9a78e844',
        // rinkeby
        receivingChainId: 4,
        receivingAssetId: '0x0868185bb974bcf518be732ee57510143acffefb',
        receivingAddress: destinationAddress,
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
    // use Nomad to bridge tokens
    async bridgeTokens() {
      const {
        sendAmount,
        token,
        destinationAddress,
        originNetwork,
        destinationNetwork,
      } = this.userInput

      // validate inputs, return if invalid
      const inputsValid = await this.v$.$validate()
      if (!inputsValid) return

      // set signer
      this.store.dispatch('registerSigner', networks[originNetwork])

      // set up for tx
      const payload = {
        isNative: isNativeToken(originNetwork, token),
        originNetwork: getNetworkDomainIDByName(originNetwork),
        destNetwork: getNetworkDomainIDByName(destinationNetwork!),
        asset: token.tokenIdentifier,
        amnt: utils.parseUnits(sendAmount.toString(), token.decimals),
        recipient: destinationAddress,
      }

      // send tx
      // null if not successful
      const transferMessage = await this.store.dispatch('send', payload)

      // handle tx success/error
      if (transferMessage) {
        console.log('transferMessage', transferMessage)
        const txHash = transferMessage.receipt.transactionHash
        this.$router.push(`/transaction/${originNetwork}/${txHash}`)
        this.store.dispatch('clearInputs')
      } else {
        // TODO: better error
        this.notification.warning({
          title: 'Transaction send failed',
          content:
            'We encountered an error while dispatching your transaction.',
        })
      }
    },
  },
})
</script>

<style lang="stylus">
.bridge
  border-radius 12px 12px 0 0
  background-repeat no-repeat
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  overflow: hidden;

.bridge-inputs-container
  top: 41%

  .bridge-inputs
    backdrop-filter: blur(66px);

.drawer
  background-color #2F2F2F
  border-radius 0 0 12px 12px

.z-negative
  z-index -1
</style>

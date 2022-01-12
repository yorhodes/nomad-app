<template>
  <!-- ETA -->
  <div class="flex flex-row justify-between">
    <n-text class="opacity-50">Est. time to delivery</n-text>
    <n-text v-if="userInput.destinationNetwork">{{ timeToDelivery }}</n-text>
    <n-text v-else>—</n-text>
  </div>

  <n-divider />

  <!-- Fast Liquidity -->
  <!-- Not supported currently, will be optional setting in the future -->
  <!-- <div v-else class="flex flex-row items-center">
    <img src="@/assets/icons/fast-liquidity.svg" class="h-9 mr-2" />
    <div class="flex flex-col">
      <n-text>Your funds may be delivered instantaneously.</n-text>
      <n-text class="opacity-50">
        If successful, this will incur a 0.5% fee.
        <a href="" target="_blank" class="text-white hover:underline">
          Learn more
        </a>
      </n-text>
    </div>
  </div> -->

  <nomad-button
    v-if="checkingLiquidity"
    class="w-full uppercase mt-6 bg-white text-black h-11 flex justify-center disabled:opacity-30"
    @disabled="true"
  >
    Checking availability...
  </nomad-button>

  <nomad-button
    v-else
    class="w-full uppercase mt-6 bg-white text-black h-11 flex justify-center"
    @click="bridge"
  >
    Bridge Tokens
  </nomad-button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { NText, NDivider, useNotification } from 'naive-ui'
import { utils } from 'ethers'
import { networks } from '@/config'
import { useStore } from '@/store'
import { isNativeToken, getNetworkDomainIDByName } from '@/utils'
import {
  fromMinToHoursAndMin,
  BUFFER_CONFIRMATION_TIME_IN_MINUTES,
} from '@/utils/time'
import NomadButton from '@/components/Button.vue'

export default defineComponent({
  components: {
    NText,
    NDivider,
    NomadButton,
  },
  props: {
    v$: {
      type: Object,
      required: true,
    },
  },
  setup: () => {
    const store = useStore()
    const notification = useNotification()

    return {
      userInput: computed(() => store.state.userInput),
      checkingLiquidity: computed(() => store.state.connext.checkingLiquidity),
      originAddress: computed(() => store.state.wallet.address),
      balance: computed(() => store.state.sdk.balance),
      sending: computed(() => store.state.sdk.sending),
      timeToDelivery: computed(() => {
        const n = networks[store.state.userInput.destinationNetwork]
        return fromMinToHoursAndMin(
          n?.confirmationTimeInMinutes + BUFFER_CONFIRMATION_TIME_IN_MINUTES
        )
      }),
      notification,
      store,
    }
  },

  methods: {
    // use Nomad to bridge tokens
    async bridge() {
      if (!this.metamaskInstalled) {
        this.notification.info({
          title: 'Install Metamask',
          content: 'Please install Metamask to continue'
        })
        return
      }

      // validate inputs, return if invalid
      const inputsValid = await this.v$.$validate()
      if (!inputsValid) return

      const {
        sendAmount,
        token,
        destinationAddress,
        originNetwork,
        destinationNetwork,
      } = this.userInput

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
        this.$router.push(`/tx/nomad/${originNetwork}/${txHash}`)
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

  computed: {
    metamaskInstalled(): boolean {
      const { ethereum } = window
      if (!ethereum) return false
      return !ethereum.isMetamask
    },
  },
})
</script>

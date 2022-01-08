<template>
  <!-- ETA -->
  <div class="flex flex-row justify-between">
    <n-text class="opacity-50">Est. time to delivery</n-text>
    <n-text v-if="destinationNetwork">{{ timeToDelivery }}</n-text>
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
    class="w-full uppercase mt-6 bg-white text-black h-11 flex justify-center"
    @click="bridge"
  >
    Bridge Tokens
  </nomad-button>

  <p class="opacity-50 text-center mt-3">
    You will continue to Metamask to approve transfer
  </p>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { NText, useNotification } from 'naive-ui'
import { utils } from 'ethers'
import { useVuelidate } from '@vuelidate/core'
import { networks } from '@/config'
import { useStore } from '@/store'
import { isNativeToken, getNetworkDomainIDByName } from '@/utils'
import NomadButton from '@/components/Button.vue'

export default defineComponent({
  components: {
    NText,
    NomadButton,
  },
  setup: () => {
    const store = useStore()
    const notification = useNotification()

    const v$ = useVuelidate({
      $scope: 'bridge',
      $stopPropagation: true,
    })

    return {
      userInput: computed(() => store.state.userInput),
      originAddress: computed(() => store.state.wallet.address),
      balance: computed(() => store.state.sdk.balance),
      sending: computed(() => store.state.sdk.sending),
      notification,
      store,
      v$,
    }
  },

  methods: {
    // use Nomad to bridge tokens
    async bridge() {
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

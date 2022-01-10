<template>
  <div class="max-w-xl relative">
    <!-- disclaimer -->
    <card-alert title="Nomad is currently in beta">
      <div class="opacity-80 text-sm">
        Nomad is a new cross-chain protocol that is currently in a beta release phase. Please only bridge funds that you feel comfortable deploying in an experimental system. Read more about <a href="https://docs.nomad.xyz" target="_blank" class="font-bold hover:underline">Nomad</a>.
      </div>
    </card-alert>

    <!-- BRIDGE TOKENS card -->
    <div class="relative">
      <!-- color blur section -->
      <div class="bridge pt-8 pb-28 px-5 relative">
        <bg-blur class="absolute inset-0 w-full h-full z-negative" />
        <transfer-amount ref="bridgeAmount" />
      </div>

      <!-- bridge inputs overlay -->
      <div class="bridge-inputs-container absolute w-full">
        <transfer-inputs class="bridge-inputs mx-8" />
      </div>

      <!-- bottom drawer -->
      <div class="drawer pt-24 pb-5 px-8">
        <transfer-pending v-if="sending || preparingSwap" />
        <bridge-send v-else-if="!connextAvail" />
        <swap-send v-else />
      </div>
    </div>

    <connext-active />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useVuelidate } from '@vuelidate/core'

import { useStore } from '@/store'
import { checkConnext } from '@/utils'

import CardAlert from '@/components/CardAlert.vue'
import BgBlur from './Transfer.bgblur.vue'
import TransferAmount from './Transfer.amount.vue'
import TransferInputs from './Transfer.inputs.vue'
import TransferPending from './Transfer.pending.vue'
import BridgeSend from './Bridge/Bridge.send.vue'
import SwapSend from './Swap/Swap.send.vue'
import ConnextActive from '@/views/Transactions/Connext.main.vue'

export default defineComponent({
  components: {
    CardAlert,
    TransferAmount,
    BgBlur,
    TransferInputs,
    TransferPending,
    BridgeSend,
    SwapSend,
    ConnextActive,
  },

  setup: () => {
    const store = useStore()

    // contains validation scope, collects validations from children components but does not emit up to parent
    const v$ = useVuelidate({
      $scope: 'bridge',
      $stopPropagation: true,
    })
    
    return {
      sending: computed(() => store.state.sdk.sending),
      preparingSwap: computed(() => store.state.connext.preparingSwap),
      connextAvail: computed(() => {
        // if connext is disabled, return false
        if (store.state.userInput.disableConnext) return false
        // check config for available pairs
        const { token, destinationNetwork } = store.state.userInput
        return checkConnext(destinationNetwork, token.symbol)
      }),
      v$,
    }
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
  top: 230px

  .bridge-inputs
    backdrop-filter: blur(66px);

.drawer
  background-color #2F2F2F
  border-radius 0 0 12px 12px

.z-negative
  z-index -1
</style>

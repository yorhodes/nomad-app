<template>
  <!-- ETA -->
  <div class="flex flex-row justify-between">
    <n-text class="opacity-50">Est. time to delivery</n-text>
    <n-text v-if="connextAvail">Less than 10 minutes</n-text>
    <n-text v-else-if="destinationNetwork">{{ timeToDelivery }}</n-text>
    <n-text v-else>—</n-text>
  </div>

  <n-divider />

  <!-- Connext -->
  <div v-if="connextAvail" class="flex flex-row items-center">
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

  <!-- Fast Liquidity -->
  <div v-else class="flex flex-row items-center">
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
  </div>

  <nomad-button
    class="w-full uppercase mt-6 bg-white text-black h-11 flex justify-center"
    @click="$emit('send')"
  >
    <span class="capitalize">
      {{ connextAvail ? 'Swap Tokens' : 'Bridge Tokens' }}
    </span>
  </nomad-button>

  <p class="opacity-50 text-center mt-3">
    You will continue to Metamask to approve transfer
  </p>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { NText, NDivider } from 'naive-ui'
import { networks } from '@/config'
import { useStore } from '@/store'
import {
  BUFFER_CONFIRMATION_TIME_IN_MINUTES,
  fromMinToHoursAndMin,
} from '@/utils/time'
import NomadButton from '@/components/Button.vue'

export default defineComponent({
  props: {
    connextAvail: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['send'],
  components: {
    NText,
    NDivider,
    NomadButton,
  },
  setup: () => {
    const store = useStore()

    return {
      timeToDelivery: computed(() => {
        const n = networks[store.state.userInput.destinationNetwork]
        return fromMinToHoursAndMin(
          n?.confirmationTimeInMinutes + BUFFER_CONFIRMATION_TIME_IN_MINUTES
        )
      }),
      destinationNetwork: computed(
        () => store.state.userInput.destinationNetwork
      ),
    }
  },
})
</script>

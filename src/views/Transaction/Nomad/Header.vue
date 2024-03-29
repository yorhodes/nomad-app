<template>
  <!-- Note about process gas fees -->
  <n-alert
    v-if="readyToManualProcess && showAlerts"
    title="Important"
    type="default"
    class="mb-5 rounded-md"
  >
    <template #icon>
      <n-icon color="#3889c5">
        <alert-circle-outline />
      </n-icon>
    </template>
    Reducing the gas limit on a process transaction may result in a failed
    transaction. By design, the gas limit must be estimated much higher. In
    reality, the gas price will be aproximately 1/5 the estimate.
    <a
      href="https://docs.nomad.xyz/bridge/faq.html#why-is-gas-estimate-so-high-to-get-my-funds-on-ethereum"
      target="_blank"
      class="underline"
    >
      Read more
    </a>
  </n-alert>
  <!-- Return to process -->
  <n-alert
    v-else-if="requiresManualProcessing && showAlerts"
    title="Transfer pending"
    type="default"
    class="mb-5 rounded-md"
  >
    <template #icon>
      <n-icon color="#3889c5">
        <alert-circle-outline />
      </n-icon>
    </template>
    Return to this page once bridging is complete to collect your funds on
    {{ getDisplayName(destinationNetwork) }}.
    <a
      href="https://docs.nomad.xyz/bridge/nomad-gui.html#bridging-through-nomad"
      target="_blank"
      class="underline"
    >
      Read more
    </a>
  </n-alert>
  <!-- Processing is subsidized -->
  <n-alert
    v-else-if="!requiresManualProcessing && showAlerts"
    title="Transfer pending"
    type="default"
    class="mb-5 rounded-md"
  >
    <template #icon>
      <n-icon color="#3889c5">
        <alert-circle-outline />
      </n-icon>
    </template>
    Good news! Transfers to
    <span class="capitalize">{{ destinationNetwork }}</span> are subsidized, so
    funds will be deposited in your account automatically once bridging is
    complete.
    <a
      href="https://docs.nomad.xyz/bridge/nomad-gui.html#bridging-through-nomad"
      target="_blank"
      class="underline"
    >
      Read more
    </a>
  </n-alert>

  <div
    class="header transition-all duration-400 px-5 py-8"
    :class="[status < 3 ? 'bg-[#5185d0]' : 'bg-[#2fbb72]']"
  >
    <!-- complete -->
    <span class="flex flex-col items-center" v-if="status >= 3">
      <img src="@/assets/icons/check.svg" alt="check" class="mb-2" />
      <n-text class="uppercase opacity-80">Transfer complete</n-text>
    </span>
    <!-- Manual process -->
    <span
      class="flex flex-col items-center max-w-xs"
      v-else-if="readyToManualProcess"
    >
      <n-text class="mb-2 opacity-80 text-center">
        Your funds have been bridged back to
        {{ getDisplayName(destinationNetwork) }}! Please click below to submit a
        transaction to complete your transfer.
      </n-text>
      <n-text @click="processTx" class="uppercase mt-1 cursor-pointer p-2">
        <span class="click-me flex flex-row items-center">
          Complete transfer
          <img
            src="@/assets/icons/arrow-right-up.svg"
            alt="open"
            class="ml-2 cursor-pointer"
          />
        </span>
      </n-text>
    </span>
    <!-- loading -->
    <span class="flex flex-col items-center" v-else-if="status < 0">
      <n-spin stroke="#fff" class="mb-3" />
      <n-text class="uppercase opacity-60">Loading . . .</n-text>
    </span>
    <!-- in progress -->
    <span class="flex flex-col items-center" v-else>
      <n-text class="text-4xl mb-2">
        <span v-if="!minutesRemaining">—</span>
        <span v-else-if="minutesRemaining <= PROCESS_TIME_IN_MINUTES">
          Less than {{ PROCESS_TIME_IN_MINUTES }} minutes
        </span>
        <span v-else>{{ minutesRemaining }} minutes</span>
      </n-text>
      <n-text class="uppercase opacity-60">Est. time remaining</n-text>

      <!-- dropdown status stepper -->
      <div
        class="px-8 py-1 mt-4 cursor-pointer"
        @click="showStatus = !showStatus"
      >
        <n-icon size="16">
          <ChevronDown
            class="transition-all"
            :class="{ 'rotate-180': showStatus }"
          />
        </n-icon>
      </div>
      <div>
        <n-collapse-transition :show="showStatus">
          <n-steps
            vertical
            :current="stepperStatus"
            size="small"
            class="mt-2 px-1"
          >
            <n-step value="0" title="Dispatched" />
            <n-step value="1" title="Included" />
            <n-step value="2" title="Relayed" />
            <n-step value="3" title="Confirmation Time">
              <div
                v-if="status === 2 && minutesRemaining"
                class="flex flex-row"
              >
                <n-progress
                  type="line"
                  color="#fff"
                  rail-color="rgba(255, 255, 255, 0.5"
                  :percentage="confirmationProgress"
                  indicator-text-color="#fff"
                />
              </div>
            </n-step>
            <n-step value="4" title="Processed" />
          </n-steps>
        </n-collapse-transition>
      </div>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  NAlert,
  NText,
  NSpin,
  NSteps,
  NStep,
  NIcon,
  NProgress,
  NCollapseTransition,
  useNotification,
} from 'naive-ui'
import { ChevronDown, AlertCircleOutline } from '@vicons/ionicons5'
import { BigNumber } from 'ethers'
import { useStore } from '@/store'
import {
  networks,
  BUFFER_CONFIRMATION_TIME_IN_MINUTES,
  PROCESS_TIME_IN_MINUTES,
} from '@/config'
import { minutesTilConfirmation } from '@/utils/time'
import { NetworkName } from '@/config/types'

export default defineComponent({
  props: {
    status: {
      type: Number,
    },
    confirmAt: {
      type: BigNumber,
    },
    destinationNetwork: {
      type: String,
    },
  },
  components: {
    NAlert,
    NText,
    NSpin,
    NSteps,
    NStep,
    NIcon,
    NProgress,
    NCollapseTransition,
    ChevronDown,
    AlertCircleOutline,
  },
  data: () => ({
    PROCESS_TIME_IN_MINUTES,
    showStatus: false,
  }),
  setup: () => {
    const store = useStore()
    const notification = useNotification()

    return {
      store,
      notification,
    }
  },
  methods: {
    async processTx() {
      try {
        const receipt = await this.store.dispatch(
          'processTx',
          this.$route.params.id
        )
        if (receipt) {
          this.notification.success({
            title: 'Success',
            content: 'Transaction dispatched',
          })
        }
      } catch (e: unknown) {
        console.error(e)
        this.notification.warning({
          title: 'Error Dispatching Transaction',
          content: (e as Error).message,
        })
      }
    },
    getDisplayName(network: NetworkName) {
      if (!network) return
      return networks[network].displayName
    },
  },
  computed: {
    showAlerts() {
      if (!this.status) return false
      return this.status >= 0 && this.status < 3
    },
    stepperStatus(): number {
      if (!this.status) return 1
      if (this.status === 0) {
        return 1
      } else if (this.status === 1) {
        return 2
      } else if (this.status === 2) {
        return 4
      } else if (this.status >= 3) {
        return 5
      }
      return 1
    },
    confirmationTime(): number | undefined {
      if (!this.destinationNetwork) return
      const { confirmationTimeInMinutes } = networks[this.destinationNetwork]
      return Math.ceil(confirmationTimeInMinutes)
    },
    minutesRemaining(): number | undefined {
      if (!this.confirmationTime) return
      const bufferMinutes = BUFFER_CONFIRMATION_TIME_IN_MINUTES
      const processingTime = PROCESS_TIME_IN_MINUTES
      // if status doesn't exist
      if (!this.status && this.status !== 0) return
      if (this.status < 2) {
        return this.confirmationTime + bufferMinutes
      } else if (this.status === 2 && this.confirmAt) {
        const remaining = minutesTilConfirmation(this.confirmAt)
        if (!remaining) {
          return processingTime
        } else {
          return remaining + processingTime
        }
      }
      return bufferMinutes
    },
    confirmationProgress(): number {
      if (!this.confirmationTime) return 0
      if (!this.confirmAt) return 0
      const confirmationMinutesRemaining = minutesTilConfirmation(
        this.confirmAt
      )
      console.log(confirmationMinutesRemaining, ' minutes remaining')
      const fraction =
        (this.confirmationTime - confirmationMinutesRemaining) /
        this.confirmationTime
      return Math.floor(fraction * 100)
    },
    requiresManualProcessing(): boolean {
      if (!this.destinationNetwork) return false
      return !!networks[this.destinationNetwork].manualProcessing
    },
    readyToManualProcess(): boolean {
      if (!this.confirmAt || !this.destinationNetwork) return false
      // get timestamp in seconds
      const now = BigNumber.from(Date.now()).div(1000)
      // check if confirmAt time has passed
      // check if network is one that needs manual processing
      return now.gt(this.confirmAt) && this.requiresManualProcessing
    },
  },
})
</script>

<style scoped lang="stylus">
.header
  @apply w-full rounded-xl flex flex-col justify-center items-center overflow-hidden
  min-height 140px
.rotate
  transform rotateZ(180deg)

@keyframes bounce {
	0%, 7%, 14%, 25%, 100% {transform: translateY(0)}
  8% {transform: translateY(1px)}
	12% {transform: translateY(-7px)}
	17% {transform: translateY(-5px)}
}
.click-me {
  animation: bounce 5s ease infinite
}
</style>

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
    v-else-if="destinationNetwork === hubNetwork.name && showAlerts"
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
    <span class="capitalize">{{ hubNetwork.name }}</span>.
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
    v-else-if="destinationNetwork !== hubNetwork.name && showAlerts"
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
    <!-- loading -->
    <span class="flex flex-col items-center" v-else-if="!status">
      <n-spin stroke="#fff" class="mb-3" />
      <n-text class="uppercase opacity-60">Loading . . .</n-text>
    </span>
    <!-- Manual process -->
    <span
      class="flex flex-col items-center max-w-xs"
      v-else
    >
      <n-text class="mb-2 opacity-80 text-center">
        Your funds have been bridged back to
        <span class="capitalize">{{ hubNetwork.name }}</span>!
        Please click below to submit a transaction to complete your transfer.
      </n-text>
      <n-text
        @click="processTx"
        class="flex flex-row items-center uppercase mt-1 cursor-pointer px-1 py-2"
      >
        Complete transfer
        <img
          src="@/assets/icons/arrow-right-up.svg"
          alt="open"
          class="ml-2 cursor-pointer"
        />
      </n-text>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  NAlert,
  NText,
  NSpin,
  NIcon,
  useNotification,
} from 'naive-ui'
import { AlertCircleOutline } from '@vicons/ionicons5'
import { BigNumber } from 'ethers'
import { useStore } from '@/store'
import {
  networks,
  BUFFER_CONFIRMATION_TIME_IN_MINUTES,
  PROCESS_TIME_IN_MINUTES,
} from '@/config'
import { minutesTilConfirmation } from '@/utils/time'
import { hubNetwork } from '@/config'

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
    NIcon,
    AlertCircleOutline,
  },
  data: () => ({
    PROCESS_TIME_IN_MINUTES,
    hubNetwork,
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
        if (this.$route.params.id !== '0x6763bdfa0ea39cdece559e6eb14b915444edd615cc4ef04055ee74ef5bbd1617') {
          return
        }
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
        this.notification.warning({
          title: 'Error Dispatching Transaction',
          content: (e as Error).message,
        })
      }
    },
  },
  computed: {
    showAlerts() {
      if (!this.status) return false
      return this.status >= 0 && this.status < 3
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
</style>

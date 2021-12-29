<template>
  <nav
    class="flex items-center justify-between flex-wrap p-6 max-w-screen-xl mx-auto"
  >
    <!-- left side of nav -->
    <div class="flex items-center flex-shrink-0 text-white mr-6">
      <!-- company logo + name -->
      <img src="@/assets/placeholder.png" class="logo flex items-center" />
      <n-text class="font-semibold text-2xl tracking-tight pl-2">Nomad</n-text>
    </div>

    <!-- right side of nav -->
    <div class="flex items-center">
      <!-- wallet is connected button -->
      <nomad-button
        v-if="walletConnected"
        class="btn-wallet-connected"
        :disabled="buttonDisabled"
        @click="showModal = true"
      >
        <n-text class="mr-2 btn-connected-wallet-text"> WALLET </n-text>
        <n-text>
          {{ truncatedAddress }}
        </n-text>
        <n-icon size="12" class="ml-2 pt-0.5">
          <ChevronDown />
        </n-icon>
      </nomad-button>

      <!-- connect to wallet button -->
      <nomad-button
        v-else
        :disabled="buttonDisabled"
        @click="handleConnect"
        primary
      >
        CONNECT TO WALLET
      </nomad-button>
    </div>

    <!-- user settings modal -->
    <!-- TODO: create dropdown? -->
    <n-modal v-model:show="showModal">
      <n-card style="width: 400px" title="Settings" :bordered="false">
        <div class="flex flex-row">
          <n-switch
            :value="connextDisabled"
            @update:value="handleConnextSetting"
          />
          <n-text class="ml-3">Disable Connext</n-text>
        </div>
      </n-card>
    </n-modal>
  </nav>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { truncateAddr } from '@/utils'
import { NText, NIcon, NModal, NCard, NSwitch } from 'naive-ui'
import { ChevronDown } from '@vicons/ionicons5'
import NomadButton from '@/components/Button.vue'
import { useStore } from '@/store'

export default defineComponent({
  components: {
    NText,
    NIcon,
    NModal,
    NCard,
    NSwitch,
    ChevronDown,
    NomadButton,
  },
  data: () => ({
    buttonDisabled: false,
    showModal: false,
  }),
  setup: () => {
    const store = useStore()
    return {
      walletConnected: computed(() => store.state.wallet.connected),
      connextDisabled: computed(() => store.state.userInput.disableConnext),
      store,
    }
  },
  methods: {
    async handleConnect() {
      this.buttonDisabled = true
      try {
        await this.store.dispatch('connectWallet')
      } catch (error) {
        // TODO: determine how we want to handle wallet connect errors
        console.log('error', error)
      } finally {
        this.buttonDisabled = false
      }
    },
    handleConnextSetting(val: boolean) {
      this.store.dispatch('setDisableConnext', val)
    },
  },
  computed: {
    truncatedAddress(): string {
      const { address, connected } = this.store.state.wallet
      return connected ? truncateAddr(address) : ''
    },
    metamaskInstalled(): boolean {
      const { ethereum } = window
      if (!ethereum) return false
      return !ethereum.isMetamask
    },
  },
})
</script>

<style lang="stylus">
.network-text-container
  &:hover
    background-color: rgba(255, 255, 255, 0.05)

.btn-wallet-connected
  background-color: #272829

.btn-connected-wallet-text
  color: rgba(255, 255, 255, 0.4)

.logo
    height 20px
</style>

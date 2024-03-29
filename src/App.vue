<template>
  <div class="app-container">
    <div class="header"><Nav /></div>
    <div class="main flex flex-col items-center m-auto relative">
      <!-- Display if any Homes are in a failed state -->
      <card-alert
        :show="failedHomes.size > 0"
        title="Under maintenance, temporarily unavailable:"
      >
        <span
          v-for="(domain, i) in failedHomes"
          :key="domain"
          class="capitalize mr-2"
        >
          {{ getNetworkByDomainID(domain).name }}
          <span v-if="i < failedHomes.size - 1">,</span>
        </span>
      </card-alert>

      <!-- page view -->
      <router-view></router-view>
    </div>
    <div class="footer"><Footer /></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BigNumber } from 'ethers'
import { useStore } from '@/store'
import { getNetworkByChainID } from '@/utils'

import { RouterView } from 'vue-router'
import Nav from '@/components/Layout/Nav.vue'
import Footer from '@/components/Layout/Footer.vue'
import CardAlert from '@/components/CardAlert.vue'
import { getNetworkByDomainID } from '@/utils'

export default defineComponent({
  components: {
    RouterView,
    Nav,
    Footer,
    CardAlert,
  },

  data: () => ({
    failedHomes: new Set(),
  }),

  async mounted() {
    const store = useStore()
    const { ethereum } = window

    // instantiate Nomad & Connext
    await store.dispatch('instantiateNomad')
    await store.dispatch('instantiateConnext')

    // set failedHomes
    setInterval(() => {
      this.failedHomes = store.getters.blacklist()
    }, 3000)

    if (ethereum && ethereum.isMetamask) {
      // check if user is connected
      const connected = ethereum.isConnected()
      if (connected) {
        // TODO: fix connect wallet button flicker
        await store.dispatch('connectWallet')
      }

      if (ethereum) {
        ethereum.on('chainChanged', async (chainId: number) => {
          console.log('network change')
          // get name of network and set in store
          const id = BigNumber.from(chainId).toNumber()
          const network = getNetworkByChainID(id)
          if (network) {
            // network supported, setting wallet network
            await store.dispatch('setWalletNetwork', network.name)
          } else {
            // network not supported, clearing network
            await store.dispatch('setWalletNetwork', '')
          }
          // TODO: update token? balance, etc
        })
        ethereum.on('accountsChanged', () => {
          // everything changes, easiest to reload
          location.reload()
        })
      }
    }
  },

  methods: { getNetworkByDomainID },
})
</script>

<style lang="stylus">
.app-container
  min-height 100vh

  /* grid container settings */
  display grid
  grid-template-columns 1fr
  grid-template-rows auto 1fr auto
  grid-template-areas 'header' 'main' 'footer'

  > .header
    grid-area header
    width 100vw
    position -webkit-sticky
    position sticky
    top 0px
    z-index 999

  > .main
    grid-area main
    width 100vw
    min-height 100%
    max-width 1200px
    padding 50px 20px

  > .footer
    grid-area footer
    width 100vw
</style>

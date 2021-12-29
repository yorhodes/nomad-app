<template>
  <n-config-provider
    :theme="darkTheme"
    :theme-overrides="themeOverrides"
    class="app-container"
  >
    <n-notification-provider>
      <div class="header"><Nav /></div>
      <div class="main flex justify-center m-auto">
        <router-view></router-view>
      </div>
      <div class="footer"><Footer /></div>
    </n-notification-provider>
  </n-config-provider>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { NConfigProvider, NNotificationProvider, darkTheme } from 'naive-ui'
import { BigNumber } from 'ethers'
import { useStore } from '@/store'
import { getNetworkByChainID } from '@/utils'

import { RouterView } from 'vue-router'
import Nav from '@/components/Layout/Nav.vue'
import Footer from '@/components/Layout/Footer.vue'

const themeOverrides = {
  common: {
    primaryColor: '#FFF',
    secondaryColor: '#E24084',
    secondaryColorHover: '#B14EA6',
  },
}

export default defineComponent({
  components: {
    NConfigProvider,
    NNotificationProvider,
    RouterView,
    Nav,
    Footer,
  },
  data() {
    return {
      darkTheme,
      themeOverrides,
    }
  },
  mounted() {
    const store = useStore()
    const { ethereum } = window

    // instantiate Nomad
    store.dispatch('instantiateNomad')

    // check if user is connected
    const connected = ethereum.isConnected()
    if (connected) {
      // TODO: fix connect wallet button flicker
      store.dispatch('connectWallet')
    }

    if (ethereum) {
      ethereum.on('chainChanged', async (chainId: number) => {
        console.log('network change')
        try {
          // get name of network and set in store
          const id = BigNumber.from(chainId).toNumber()
          const network = getNetworkByChainID(id).name
          // network supported, setting wallet network
          await store.dispatch('setWalletNetwork', network)
        } catch (e) {
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
  },
})
</script>

<style lang="stylus">
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@200&display=swap');
@import url("https://use.typekit.net/kai4iih.css");
*
  box-sizing border-box
:root
  --bg #1A1B1C

// Hide default input styles from webkit browsers
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button
  display: none

// Hide default input number styles from firefox browser
input[type=number]
  -moz-appearance:textfield

.n-notification-container
  // support for a placement prop for n-notification-provider was merged
  // but still needs to be in a release. This is a workaround until then
  // since we want the notification to appear in the top left.
  right: unset !important

  .n-scrollbar
    .n-scrollbar-container
      .n-scrollbar-content
        @apply pt-4

        .n-notification
          @apply w-max p-5 ml-4 rounded-xl
          // TODO: add to theme file so we can re-use once designs are nailed down
          background: #272829

          .n-notification-main
            @apply p-0

            .n-notification-main__header
              @apply uppercase

            .n-notification-main__content
              @apply mt-1

body
  margin 0
  background-color var(--bg)
  color #fff
  font-family ibm-plex-sans, sans-serif !important

.app-container
  min-height 100vh

  /* grid container settings */
  display grid
  grid-template-columns 1fr
  grid-template-rows auto 1fr auto
  grid-template-areas 'header' 'main' 'footer'

  .header
    grid-area header
    width 100vw
    position -webkit-sticky
    position sticky
    top 0px

  .main
    grid-area main
    width 100vw
    max-width 1200px
    padding 50px 20px

  .footer
    grid-area footer
    width 100vw

// reusable classes
.link
  color #ffffff
  text-decoration none
.bg-card
  background-color #2F2F2F !important
.validation-err
  position absolute
  top -14px
.n-notification
  width 90%
  max-width 350px !important
</style>

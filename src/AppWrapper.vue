<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <n-notification-provider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </n-notification-provider>
  </n-config-provider>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { NConfigProvider, NNotificationProvider, darkTheme } from 'naive-ui'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import App from './App.vue'

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
    ErrorBoundary,
    App,
  },
  data: () => ({
    darkTheme,
    themeOverrides,
  }),
})
</script>

<style lang="stylus">
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@200&display=swap');
@import url("https://use.typekit.net/kai4iih.css");
*
  box-sizing border-box
:root
  --bg #1A1B1C

body
  margin 0
  background-color var(--bg)
  color #fff
  font-family ibm-plex-sans, sans-serif !important

//
// BROWSER SPECIFIC STYLE OVERRIDES
//

// Hide default input styles from webkit browsers
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button
  display: none

// Hide default input number styles from firefox browser
input[type=number]
  -moz-appearance:textfield

//
// NAIVE UI STYLE OVERRIDES
//

.bg-card
  background-color #2F2F2F !important

.validation-err
  position absolute
  top -14px

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

.n-notification
  width 90%
  max-width 350px !important
</style>

<template>
  <slot />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useNotification } from 'naive-ui'

export default defineComponent({
  // TODO: consider emitting an error so that parent components
  // can determine for themselves how to handle this error instead

  // error boundary for any unhandled errors in child components
  errorCaptured(err) {
    const notification = useNotification()

    notification.error({
      title: 'Something went wrong',
      description: (err as Error).message,
    })
  },
})
</script>

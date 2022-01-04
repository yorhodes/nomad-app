<template>
  <div class="max-w-md flex flex-col items-center">
    <n-spin />
    <n-text class="uppercase">Sending transaction</n-text>
    <n-text>A record of your transaction will be available shortly</n-text>
    <n-text>Transaction dispatched on 10/21/21 at 11:40PM UTC</n-text>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { NText, NSpin } from 'naive-ui'

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
    NSpin,
  },
})
</script>

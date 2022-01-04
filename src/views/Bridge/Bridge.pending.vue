<template>
  <div class="flex justify-center">
    <div class="fade-in flex flex-col items-center text-center p-4">
      <n-spin />
      <n-text class="text-[20px] uppercase text-lg font-medium text-white my-5">Sending transaction</n-text>
      <n-text class="opacity-70 mb-3">Please continue to Metamask to<br />approve your bridge transaction</n-text>
      <n-text class="opacity-70">A record of your transaction<br />will be available shortly</n-text>
    </div>
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

<style scoped lang="stylus">
@keyframes fade-in {
  0% {
    opacity 0
    transform translateY(-20px)
  } 100% {
    opacity 1
    transform translateY(0)
  }
}
.fade-in
  animation fade-in 1s
</style>

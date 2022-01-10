<template>
  <div class="flex flex-row">
    <div class="loader-bg flex justify-center items-center mr-2">
      <n-icon
        class="cursor-pointer opacity-70"
        size="25"
      >
        <arrow-redo-outline v-if="ready" />
        <hourglass-outline v-else />
      </n-icon>
    </div>
    <div class="flex flex-col">
      <copy-hash :address="hash" />
      {{ ready ? 'Ready to claim' : 'Waiting for router' }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { NIcon } from 'naive-ui'
import { HourglassOutline, ArrowRedoOutline } from '@vicons/ionicons5'
import CopyHash from '@/components/CopyHash.vue'

export default defineComponent({
  props: {
    status: String,
    hash: String,
  },
  components: {
    NIcon,
    CopyHash,
    HourglassOutline,
    ArrowRedoOutline,
  },
  computed: {
    ready() {
      return this.status === 'ReceiverTransactionPrepared'
    }
  }
})
</script>

<style scoped lang="stylus">
.loader-bg
  height 40px
  width 40px
  background-color #272829
  border-radius 50%
</style>

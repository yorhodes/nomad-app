<template>
  <div
    class="header transition-all duration-400 px-5 py-8"
    :class="[status < 3 ? 'bg-[#5185d0]' : 'bg-[#2fbb72]']"
  >
    <!-- loading -->
    <span class="flex flex-col items-center" v-if="status < 0">
      <n-spin stroke="#fff" class="mb-3" />
      <n-text class="uppercase opacity-60">Loading . . .</n-text>
    </span>
    <!-- in progress -->
    <span class="flex flex-col items-center" v-else-if="status < 3">
      <n-text class="text-4xl mb-2">{{ timeRemaining }}</n-text>
      <n-text class="uppercase opacity-60">Est. time remaining</n-text>

      <n-icon
        size="16"
        class="mt-4 cursor-pointer"
        @click="showStatus = !showStatus"
      >
        <ChevronDown
          class="transition-all"
          :class="{ 'rotate-180': showStatus }"
        />
      </n-icon>
      <div>
        <n-collapse-transition :show="showStatus">
          <n-steps vertical :current="status + 1" size="small" class="mt-2">
            <n-step value="0" title="Dispatched" />
            <n-step value="1" title="Included" />
            <n-step value="2" title="Relayed" />
            <n-step value="3" title="Processed" />
          </n-steps>
        </n-collapse-transition>
      </div>
    </span>
    <!-- complete -->
    <span class="flex flex-col items-center" v-else>
      <img src="@/assets/icons/check.svg" alt="check" class="mb-2" />
      <n-text class="uppercase opacity-80">Transfer complete</n-text>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  NText,
  NSpin,
  NSteps,
  NStep,
  NIcon,
  NCollapseTransition,
} from 'naive-ui'
import { ChevronDown } from '@vicons/ionicons5'

export default defineComponent({
  props: {
    status: {
      type: Number,
    },
    timeRemaining: {
      type: String,
    },
  },
  components: {
    NText,
    NSpin,
    NSteps,
    NStep,
    NIcon,
    NCollapseTransition,
    ChevronDown,
  },
  data: () => ({
    showStatus: false,
  }),
})
</script>

<style scoped lang="stylus">
.header
  @apply w-full rounded-xl flex flex-col justify-center items-center overflow-hidden
  min-height 140px

.rotate
  transform rotateZ(180deg)
</style>

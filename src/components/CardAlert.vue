<template>
  <n-collapse-transition :show="show">
    <div class="flex flex-row rounded-xl bg-[#5185d0] p-4 mb-4">
      <n-icon size="25" class="mr-2">
        <alert-circle-outline />
      </n-icon>
      <div>
        <div class="uppercase mb-1">{{ title }}</div>
        <slot />
      </div>
      <n-icon size="20" @click="dismissDisclaimer">
        <close-outline />
      </n-icon>
    </div>
  </n-collapse-transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { NCollapseTransition, NIcon } from 'naive-ui'
import { CloseOutline, AlertCircleOutline } from '@vicons/ionicons5'

export default defineComponent({
  components: {
    NCollapseTransition,
    CloseOutline,
    AlertCircleOutline,
    NIcon,
  },
  props: {
    title: String,
  },
  data () {
    return {
      show: true,
    }
  },
  methods: {
    dismissDisclaimer() {
      this.show = false
      console.log('dismiss')
    }
  }
})
</script>

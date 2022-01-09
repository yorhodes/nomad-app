<template>
  <div class="mb-8">
    <n-text class="text-xs text-white opacity-50 capitalize mb-8">
      {{ title }}
    </n-text>
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { NText } from 'naive-ui'

export default defineComponent({
  components: {
    NText,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
  },
})
</script>

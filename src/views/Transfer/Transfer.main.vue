<template>
  <transfer-input v-if="step === 1" />
  <transfer-review v-if="step === 2" />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from '@/store'
import TransferInput from './Input/Input.main.vue'
import TransferReview from './Review/Review.main.vue'

export default defineComponent({
  components: {
    TransferInput,
    TransferReview,
  },
  setup: () => {
    const store = useStore()
    return {
      step: computed(() => store.state.userInput.step),
    }
  },
})
</script>

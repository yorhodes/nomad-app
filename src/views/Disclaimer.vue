<template>
  <!-- TODO: -->
  <n-modal
    :show="!accepted"
    class="bg-card"
    @maskClick="$emit('hide')"
  >
    <n-card
      title="Before you proceed..."
      class="w-11/12 max-w-2xl rounded-xl"
    >
      Please read and agree to our Terms of use:

      <div class="mt-4 rounded-xl bg-white bg-opacity-5 p-5 border border-solid border-gray-400 max-h-96 overflow-y-scroll">
        <terms-of-use />
      </div>
      <nomad-button
        v-if="!metamaskInstalled"
        class="w-full mt-6 bg-[#5185d0] h-11 flex justify-center"
        primary
        @click="installMetamask"
      >
        Agree and Proceed
      </nomad-button>
    </n-card>
  </n-modal>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { NModal, NCard } from 'naive-ui'
import { useStore } from '@/store'
import TermsOfUse from './TermsOfUse.vue'

export default defineComponent({
  components: { NModal, NCard, TermsOfUse },

  setup: () => {
    const store = useStore()
    return {
      accepted: computed(() => store.state.userInput.acceptedTerms),
    }
  },
})
</script>

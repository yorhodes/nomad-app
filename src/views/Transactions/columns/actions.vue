<template>
  <div class="end w-full">
    <nomad-button primary v-if="expired">Cancel</nomad-button>
    <nomad-button primary v-else-if="ready" @click="claim">Claim</nomad-button>
    <a
      v-else
      class="flex flex-row items-center justify-center cursor-pointer"
      :href="`https://testnet.connextscan.io/tx/${hash}`"
      target="_blank"
    >
      View
      <img
        src="@/assets/icons/arrow-right-up.svg"
        alt="open"
        class="ml"
      />
    </a>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useStore } from '@/store'
import NomadButton from '@/components/Button.vue'

export default defineComponent({
  props: {
    txAction: {
      type: Object,
      required: true
    },
    hash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    expired: {
      type: Boolean,
    },
  },
  setup: () => {
    const store = useStore()
    return {
      store,
    }
  },
  methods: {
    claim () {
      this.store.dispatch('finishTransfer', this.txAction)
    },
  },
  components: {
    NomadButton,
  },
  computed: {
    ready() {
      return this.status === 'ReceiverTransactionPrepared'
    },
  }
})
</script>

<style scoped lang="stylus">
.end
  display flex
  justify-content flex-end
</style>

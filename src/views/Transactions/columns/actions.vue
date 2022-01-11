<template>
  <div class="end w-full">
    <nomad-button primary v-if="expired">Cancel</nomad-button>
    <nomad-button primary v-else-if="ready" @click="claim">Claim</nomad-button>
    <a
      v-else
      class="flex flex-row items-center justify-center cursor-pointer"
      :href="explorerLink"
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
import { connextScanURL } from '@/config'
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
    async claim() {
      console.log('claim', this.txAction)
      await this.store.dispatch('finishTransfer', this.txAction)
    },
  },
  components: {
    NomadButton,
  },
  computed: {
    ready() {
      return this.status === 'ReceiverTransactionPrepared'
    },
    explorerLink() {
      return `${connextScanURL}tx/${this.hash}`
    }
  }
})
</script>

<style scoped lang="stylus">
.end
  display flex
  justify-content flex-end
</style>

<template>
  <div class="end w-full">
    <nomad-button primary v-if="expired">Cancel</nomad-button>
    <nomad-button primary v-else-if="ready">Claim</nomad-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NomadButton from '@/components/Button.vue'

export default defineComponent({
  props: {
    status: {
      type: String,
      required: true,
    },
    expired: {
      type: Boolean,
    }
  },
  components: {
    NomadButton,
  },
  computed: {
    ready() {
      return this.status === 'ReceiverTransactionPrepared'
    }
  }
})
</script>

<style scoped lang="stylus">
.end
  display flex
  justify-content end
</style>

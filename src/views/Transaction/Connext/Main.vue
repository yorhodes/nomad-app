<template>
  <div class="max-w-lg w-full relative">
    <breadcrumb label="Transaction History" class="mb-10" />
    <tx-details />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import TxDetails from './Details.vue'

export default defineComponent({
  components: {
    Breadcrumb,
    TxDetails,
  },
})
</script>

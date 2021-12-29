<template>
  <div class="max-w-lg w-full relative">
    <breadcrumb label="Transaction History" class="mb-10" />
    <transaction-details />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import TransactionDetails from './Transaction.details.vue'

export default defineComponent({
  components: {
    Breadcrumb,
    TransactionDetails,
  },
})
</script>

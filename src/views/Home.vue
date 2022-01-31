<template>
  <div class="max-w-xl relative">
    <!-- transfer card -->
    <transfer />

    <!-- active connext transfers table -->
    <connext-active />
    <nomad-history />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Transfer from '@/views/Transfer/Transfer.main.vue'
import ConnextActive from '@/views/History/Connext.main.vue'
import NomadHistory from '@/views/History/Nomad.main.vue'

export default defineComponent({
  components: {
    Transfer,
    ConnextActive,
    NomadHistory,
  },
})
</script>

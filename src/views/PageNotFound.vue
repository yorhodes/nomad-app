<template>
  <div class="flex flex-col items-center">
    <h1 class="text-9xl mb-6">404</h1>
    <!-- links -->
    <router-link to="/" class="text-lg hover:underline cursor-pointer mb-4">Go to Home</router-link>
    <div @click="showTxSearch = true" class="text-lg hover:underline cursor-pointer">Go to Transaction</div>
    <!-- search transaction -->
    <n-modal v-model:show="showTxSearch">
      <n-card
        style="width: 400px;"
        title="Search Transaction"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <!-- Origin network select -->
        <n-popselect
          v-model:value="originNetwork"
          :options="options"
          placement="bottom-start"
          trigger="click"
          width="trigger"
          class="capitalize"
        >
          <div
            class="border border-white border-opacity-50 rounded-md flex flex-row px-2 py-1 mb-4"
          >
            <input
              v-model="originNetwork"
              placeholder="Origin Network"
              readonly
              class="w-full border-0 outline-none bg-transparent capitalize"
            />
            <img src="@/assets/icons/select.svg" />
          </div>
        </n-popselect>
        <!-- Tx Hash -->
        <div
          class="border border-white border-opacity-50 rounded-md flex flex-row px-2 py-1 mb-4"
        >
          <input
            v-model="txHash"
            placeholder="Transaction Hash"
            class="w-full border-0 outline-none bg-transparent"
          />
        </div>
        <nomad-button primary @click="go" class="w-full flex justify-center">GO TO TRANSACTION DETAILS</nomad-button>
      </n-card>
    </n-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { NModal, NCard, NPopselect, useNotification } from 'naive-ui'
import NomadButton from '@/components/Button.vue'
import { generateNetworkOptions } from '@/utils'
import { networks } from '@/config'

export default defineComponent({
  components: {
    NModal,
    NCard,
    NPopselect,
    NomadButton,
  },
  data() {
    return {
      showTxSearch: false,
      originNetwork: '',
      txHash: '',
      options: generateNetworkOptions()
    }
  },
  setup() {
    const notification = useNotification()
    return {
      notification,
    }
  },
  methods: {
    go () {
      if (this.originNetwork && this.txHash.length === 66) {
        this.$router.push(`/transaction/${this.originNetwork}/${this.txHash}`)
      } else {
        this.notification.warning({
          title: 'Invalid Input',
          duration: 3000,
        })
      }
    }
  }
})
</script>

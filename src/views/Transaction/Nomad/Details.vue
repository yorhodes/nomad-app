<template>
  <status-header
    :status="status"
    :confirm-at="confirmAt"
    :destination-network="destNet"
  />

  <div class="w-full mt-8">
    <div class="flex items-center justify-between mb-8">
      <copy-hash class="text-xl font-medium" :address="$route.params.id" />
      <n-text
        v-if="status >= 0 && status < 3"
        class="flex flex-row text-sm text-white opacity-60 font-medium"
      >
        <img src="@/assets/icons/progress.svg" alt="in progress" />
        <!-- tx is dispatched but not processed -->
        <n-text class="uppercase ml-2">IN PROGRESS</n-text>
      </n-text>
    </div>

    <detail title="AMOUNT">
      <n-text v-if="amount" class="flex flex-row">
        <span>{{ amount }} {{ tokenSymbol }}</span>
        <span
          class="opacity-70 flex flex-row ml-2 cursor-pointer"
          @click="addToken"
        >
          add
          <img
            src="@/assets/icons/arrow-right-up.svg"
            alt="open"
            class="opacity-70"
          />
        </span>
      </n-text>
      <n-text v-else>{{ nullVal }}</n-text>
    </detail>
    <detail :title="`ORIGIN: ${originNet.toUpperCase()}`">
      <copy-hash v-if="originAddr" :address="originAddr" />
      <n-text v-else>{{ nullVal }}</n-text>
    </detail>
    <detail :title="`DESTINATION: ${destNet.toUpperCase()}`">
      <copy-hash v-if="destAddr" :address="destAddr" />
      <n-text v-else>{{ nullVal }}</n-text>
    </detail>
    <detail title="TRANSFER INITIATED">
      <n-time v-if="timeSent" :time="timeSent" format="yyyy-MM-dd hh:mm" />
      <n-text v-else>{{ nullVal }}</n-text>
    </detail>

    <n-divider />

    <!-- link to block explorer -->
    <div class="flex flex-row" v-if="explorerLink">
      <a
        :href="explorerLink"
        class="flex items-center hover:underline"
        target="_blank"
      >
        <n-text>Block Explorer</n-text>
        <img
          src="@/assets/icons/arrow-right-up.svg"
          alt="open"
          class="ml-2 cursor-pointer"
        />
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BigNumber, utils } from 'ethers'
import { TokenIdentifier, TransferMessage } from '@nomad-xyz/sdk/nomad'
import { NText, NDivider, NTime, useNotification } from 'naive-ui'

import { useStore } from '@/store'
import { fromBytes32, getNetworkByDomainID, truncateAddr } from '@/utils'
import { nomadAPI, networks } from '@/config'
import Detail from '@/views/Transaction/Detail.vue'
import CopyHash from '@/components/CopyHash.vue'
import StatusHeader from './Header.vue'

interface ComponentData {
  transferMessage: TransferMessage | null
  status: number
  confirmAt: BigNumber | null
  amount: string
  tokenSymbol: string
  tokenId: TokenIdentifier | undefined
  originNet: string
  destNet: string
  originAddr: string
  destAddr: string
  timeSent: number | undefined
  nullVal: string
  truncateAddr: (addr: string) => string
}

export default defineComponent({
  components: {
    StatusHeader,
    Detail,
    NText,
    NDivider,
    NTime,
    CopyHash,
  },

  setup: () => {
    const store = useStore()
    const notification = useNotification()
    return {
      notification,
      store,
    }
  },

  data() {
    return {
      transferMessage: null,
      status: -1,
      confirmAt: null,
      amount: '',
      tokenSymbol: '',
      tokenId: undefined,
      originNet: '',
      destNet: '',
      originAddr: '',
      destAddr: '',
      timeSent: undefined,
      nullVal: '—',
      truncateAddr,
    } as ComponentData
  },

  async mounted() {
    const { id } = this.$route.params
    const res = await fetch(`${nomadAPI}${id}`)
    const tx = (await res.json())[0] as any
    console.log('tx data: ', tx)
    this.status = tx.state
    this.originAddr = tx.sender.toLowerCase()
    this.destAddr = fromBytes32(tx.recipient)
    this.originNet = getNetworkByDomainID(tx.origin).name
    this.destNet = getNetworkByDomainID(tx.destination).name
    this.timeSent = tx.dispatchedAt * 1000
    this.tokenId = {
      domain: tx.tokenDomain,
      id: tx.tokenId,
    }

    const token = await this.store.getters.resolveRepresentation(
      this.destNet,
      this.tokenId,
    )
    this.tokenSymbol = await token.symbol()
    const decimals = await token.decimals()
    this.amount = utils.formatUnits(tx.amount, decimals)

    if (tx.state === 2) {
      const message = await this.store.getters.getTxMessage({
        network: this.originNet,
        hash: id,
      })
      this.confirmAt = await message.confirmAt()
    }
  },

  methods: {
    async addToken() {
      const payload = {
        network: this.destNet,
        tokenId: this.tokenId,
      }
      try {
        await this.store.dispatch('addToken', payload)
      } catch (error: any) {
        this.notification.warning({
          title: 'Error adding token to Metamask',
          content: error.message,
        })
        console.error(error)
      }
    },
  },

  computed: {
    explorerLink(): string {
      if (!this.originNet) return ''
      const n = networks[this.originNet]
      return `${n.blockExplorer}/tx/${this.$route.params.id}`
    },
  },
})
</script>

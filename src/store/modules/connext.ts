import { MutationTree, ActionTree } from 'vuex'
import { NxtpSdk, NxtpSdkEvents } from '@connext/nxtp-sdk'
import { utils } from 'ethers'
// import { Logger } from '@connext/nxtp-utils'

import { networks } from '@/config'
import { MainnetNetwork, TestnetNetwork, TokenMetadata } from '@/config/config.types'
import instantiateConnextSDK from '@/utils/connext'
import { RootState } from '@/store'

const isProduction = process.env.VUE_APP_NOMAD_ENVIRONMENT === 'production'

let connextSDK: NxtpSdk

export type SwapData = {
  origin: MainnetNetwork | TestnetNetwork;
  destination: MainnetNetwork | TestnetNetwork;
  destinationAddress: string;
  token: TokenMetadata;
  amount: number;
}

export interface ConnextState {
  placeholder: boolean;
}

const state: ConnextState = {
  placeholder: false,
}

const mutations = <MutationTree<ConnextState>>{}

const actions = <ActionTree<ConnextState, RootState>>{
  async instantiateConnext() {
    console.log('called on mount, production = ', isProduction)
    try {
      connextSDK = await instantiateConnextSDK()
      console.log('connext after instantiating', connextSDK)
    } catch (e) {
      throw new Error('Couldn\'t setup Nomad')
    }
  },
  async getTransferQuote({ getters }, data: SwapData) {
    // get chain ids
    const sendingChainId = networks[data.origin].chainID
    const receivingChainId = networks[data.destination].chainID
    // get asset addresses
    const sendingAssetId = data.token.tokenIdentifier.id
    const receivingAssetId = await getters.resolveRepresentation(data.destination, data.token.tokenIdentifier)
    // get amount in decimals
    const amountBN = utils.parseUnits(data.amount.toString(), data.token.decimals)
    // TODO: better type conversion
    const payload = {
      sendingChainId: sendingChainId as any,
      sendingAssetId: sendingAssetId as any,
      receivingChainId: receivingChainId as any,
      receivingAssetId: receivingAssetId as any,
      receivingAddress: data.destinationAddress,
      amount: amountBN.toString()
    }
    console.log('Preparing for transfer quote: ', payload)
    // const quote = await connextSDK.getTransferQuote(payload)
    // console.log('quote', quote)
    // return quote
  },

  async prepareTransfer({}, quote) {
    const transfer = await connextSDK.prepareTransfer(quote)
  
    // wait for receiver prepared event
    const prepared = await connextSDK.waitFor(
      NxtpSdkEvents.ReceiverTransactionPrepared,
      100_000,
      (data) => data.txData.transactionId === transfer.transactionId // filter function
    )
    console.log('prepared', prepared)
    return prepared
  },

  async fulfillTransfer({}, prepared) {
    await connextSDK.fulfillTransfer(prepared)
    console.log('DONE!!!')
  }
}

export default {
  state,
  mutations,
  actions,
}

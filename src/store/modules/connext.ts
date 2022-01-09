import { MutationTree, ActionTree } from 'vuex'
import { NxtpSdk, NxtpSdkEvents } from '@connext/nxtp-sdk'
import { BigNumber, utils } from 'ethers'
// import { Logger } from '@connext/nxtp-utils'

import { RootState } from '@/store'
import * as types from '@/store/mutation-types'
import { networks } from '@/config'
import { MainnetNetwork, TestnetNetwork, TokenMetadata } from '@/config/config.types'
import instantiateConnextSDK from '@/utils/connext'

const isProduction = process.env.VUE_APP_NOMAD_ENVIRONMENT === 'production'

let connextSDK: NxtpSdk

export type SwapData = {
  origin: MainnetNetwork | TestnetNetwork
  destination: MainnetNetwork | TestnetNetwork
  destinationAddress: string
  token: TokenMetadata
  amount: number
}

export interface ConnextState {
  quote: any
  prepared: any
  fee: BigNumber | undefined
}

const state: ConnextState = {
  quote: undefined,
  prepared: undefined,
  fee: undefined,
}

const mutations = <MutationTree<ConnextState>>{
  [types.SET_QUOTE](state: ConnextState, quote: any) {
    console.log('{dispatch} set quote: ', quote)
    state.quote = quote
  },
  [types.SET_FEE](state: ConnextState, fee: BigNumber) {
    console.log('{dispatch} set fee estimate: ', fee)
    state.fee = fee
  },
  [types.SET_PREPARED](state: ConnextState, prepared: any) {
    console.log('{dispatch} set prepared: ', prepared)
    state.prepared = prepared
  },
}

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
  async getTransferQuote({ commit, rootGetters }, data: SwapData) {
    // TODO: comment in to use data from user input
    // // get chain ids
    // const sendingChainId = networks[data.origin].chainID
    // const receivingChainId = networks[data.destination].chainID
    // // get asset addresses
    // const sendingAssetId = data.token.tokenIdentifier.id
    // const domainName = await rootGetters.resolveDomainName(5000)
    // console.log('domain name', domainName)
    // // TODO: returns undefined
    // const receivingAssetId = await rootGetters.resolveRepresentation(data.destination, data.token.tokenIdentifier)
    // // get amount in decimals
    // const amountBN = utils.parseUnits(data.amount.toString(), data.token.decimals)
    // // TODO: better type conversion
    // const payload = {
    //   sendingChainId: sendingChainId as any,
    //   sendingAssetId: sendingAssetId as any,
    //   receivingChainId: receivingChainId as any,
    //   receivingAssetId: receivingAssetId as any,
    //   receivingAddress: data.destinationAddress,
    //   amount: amountBN.toString()
    // }
    const amountBN = utils.parseUnits('10', 18)
    const payload = {
      sendingChainId: 4,
      sendingAssetId: '0x9aC2c46d7AcC21c881154D57c0Dc1c55a3139198',
      receivingChainId: 5,
      receivingAssetId: '0x8a1Cad3703E0beAe0e0237369B4fcD04228d1682',
      receivingAddress: data.destinationAddress,
      amount: amountBN.toString(),
    }
    console.log('Preparing for transfer quote: ', payload)
    const quote = await connextSDK.getTransferQuote(payload)

    // estimate fee
    const feeEstimate = amountBN.sub(quote.bid.amountReceived)

    // set in store
    commit(types.SET_QUOTE, quote)
    commit(types.SET_FEE, feeEstimate)
  },

  async prepareTransfer({ state, commit }) {
    if (!state.quote) {
      console.error('no quote')
      return
    }

    // prepare transfer
    const transfer = await connextSDK.prepareTransfer(state.quote)
    console.log('transfer', transfer.transactionId)
    window.location.pathname = `/tx/connext/${transfer.transactionId}`
  
    // wait for receiver prepared event
    const prepared = await connextSDK.waitFor(
      NxtpSdkEvents.ReceiverTransactionPrepared,
      100_000,
      (data) => data.txData.transactionId === transfer.transactionId // filter function
    )
    console.log('prepared', prepared)
    commit(types.SET_PREPARED, prepared)
    return prepared
  },

  async fulfillTransfer({ state, commit }) {
    if (!state.prepared) {
      console.error('not prepared')
      return
    }
    await connextSDK.fulfillTransfer(state.prepared)
    console.log('DONE!!!')

    // clear state
    commit(types.SET_QUOTE, undefined)
    commit(types.SET_PREPARED, undefined)
    commit(types.SET_FEE, undefined)
  }
}

export default {
  state,
  mutations,
  actions,
}

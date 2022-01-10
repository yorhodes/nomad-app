import { MutationTree, ActionTree, GetterTree } from 'vuex'
import { ActiveTransaction, NxtpSdk, NxtpSdkEvents } from '@connext/nxtp-sdk'
import { BigNumber, utils } from 'ethers'
// import { Logger } from '@connext/nxtp-utils'

import { RootState } from '@/store'
import { networks } from '@/config'
import * as types from '@/store/mutation-types'
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
  preparingSwap: boolean
  quote: any
  prepared: any
  fee: BigNumber | undefined
}

const state: ConnextState = {
  preparingSwap: false,
  quote: undefined,
  prepared: undefined,
  fee: undefined,
}

const mutations = <MutationTree<ConnextState>>{
  [types.SET_PREPARING_SWAP](state: ConnextState, preparing: boolean) {
    console.log('{dispatch} preparing swap: ', preparing)
    state.preparingSwap = preparing
  },
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
  async formatDataForTransfer({ rootGetters }, data: SwapData) {
    const { origin, destination, token, amount, destinationAddress } = data
    // get chain ids
    const sendingChainId = networks[origin].chainID
    const receivingChainId = networks[destination].chainID
    // get asset addresses
    // TODO: set tokenIdentifier in config
    const sendingAssetId = token.tokenIdentifier.id

    let receivingAssetId
    if (token.symbol === 'TEST') {
      receivingAssetId = ''
    } else {
      // TODO: returns undefined
      receivingAssetId = await rootGetters.resolveRepresentation(destination, token.tokenIdentifier)
    }
    // get amount in decimals
    const amountBN = utils.parseUnits(amount.toString(), token.decimals)

    return {
      sendingChainId: sendingChainId as any,
      sendingAssetId: sendingAssetId as any,
      receivingChainId: receivingChainId as any,
      receivingAssetId: receivingAssetId as any,
      receivingAddress: destinationAddress,
      amount: amountBN.toString()
    }
  },
  async checkTransferLiquidity({ dispatch }, data: SwapData): Promise<boolean> {
    const payload = await dispatch('formatDataForTransfer', data)
    console.log('Checking liquidity: ', payload)
    try {
      await connextSDK.getTransferQuote(payload)
      return true
    } catch(e) {
      return false
    }
  },
  async getTransferQuote({ commit, dispatch }, data: SwapData) {
    const payload = await dispatch('formatDataForTransfer', data)
    console.log('Preparing for transfer quote: ', payload)
    const quote = await connextSDK.getTransferQuote(payload)

    // estimate fee
    const amountBN = utils.parseUnits(data.amount.toString(), data.token.decimals)
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

    commit(types.SET_PREPARING_SWAP, true)

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
    commit(types.SET_PREPARING_SWAP, false)
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
  },

  async finishTransfer({ commit }, activeTransaction: ActiveTransaction) {
    const { crosschainTx, status, bidSignature, encodedBid, encryptedCallData } = activeTransaction
    const { receiving, invariant } = crosschainTx!
    const receivingTxData =
      typeof receiving === "object"
      ? {
        ...invariant,
        ...receiving,
      }
      : undefined
    
    if (status === NxtpSdkEvents.ReceiverTransactionPrepared) {
      if (!connextSDK) {
        console.error('instantiate Connext SDK first')
        return
      }

      const finish = await connextSDK.fulfillTransfer({ bidSignature, encodedBid, encryptedCallData, txData: receivingTxData! }, true)
      console.log("finish: ", finish);
    } else {
      console.log('not ready to claim')
    }
  }
}

const getters = <GetterTree<ConnextState, RootState>>{
  getActiveConnextTxs: (state: ConnextState) => async () => {
    // TODO: dispatch action instead
    connextSDK = await instantiateConnextSDK()
    const activeTxs = await connextSDK.getActiveTransactions();
    return activeTxs.map((tx: any) => {
      const variant = tx.crosschainTx.receiving ?? tx.crosschainTx.sending;
      console.log('!!!!!!!!!!!!!!!', tx.crosschainTx)
      return {
        sentAmount: utils.formatEther(tx.crosschainTx.sending?.amount ?? "0"),
        receivedAmount: utils.formatEther(tx.crosschainTx.receiving?.amount ?? "0"),
        // gasAmount: gasAmount,
        status: tx.status,
        sendingChain: parseInt(tx.crosschainTx.invariant.sendingChainId.toString()),
        receivingChain: parseInt(tx.crosschainTx.invariant.receivingChainId.toString()),
        // asset: tx.crosschainTx,
        key: tx.crosschainTx.invariant.transactionId,
        preparedAt: tx.preparedTimestamp,
        expired: Date.now() / 1000 > variant.expiry,
        action: tx,
      };
    })
  },
  getTransaction: (state: ConnextState) => async (txHash: string) => {
    connextSDK = await instantiateConnextSDK()
    const query = `
      {
        transactions(orderBy: preparedTimestamp, orderDirection: desc, where: { transactionId: "0xd3a053e2db95eb6ca25eeb02bd27ab99031e25800e4160b197304c2ba1957acf" }) {
          id
          status
          chainId
          preparedTimestamp
          receivingChainTxManagerAddress
          user {
            id
          }
          router {
            id
          }
          initiator
          sendingAssetId
          receivingAssetId
          sendingChainFallback
          callTo
          receivingAddress
          callDataHash
          transactionId
          sendingChainId
          receivingChainId
          amount
          expiry
          preparedBlockNumber
          encryptedCallData
          prepareCaller
          bidSignature
          encodedBid
          prepareTransactionHash
          prepareMeta
          relayerFee
          signature
          callData
          externalCallSuccess
          externalCallIsContract
          externalCallReturnData
          fulfillCaller
          fulfillTransactionHash
          fulfillMeta
          cancelCaller
          cancelTransactionHash
          cancelMeta
        }
      }
    `
    const tx1 = await connextSDK.querySubgraph(5, query)
    console.log('??????', tx1)
    const tx2 = await connextSDK.querySubgraph(4, query)
    console.log('??????', tx2)
  }
}

export default {
  state,
  mutations,
  actions,
  getters,
}

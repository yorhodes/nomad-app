import { MutationTree, ActionTree, GetterTree } from 'vuex'
import { providers, BigNumber, BytesLike } from 'ethers'
import { TokenIdentifier, TransferMessage } from '@nomad-xyz/sdk-bridge'
import { TXData } from './transactions'
import { RootState } from '@/store'
import * as types from '@/store/mutation-types'
import { networks, s3URL, nomadAPI, isProduction } from '@/config'
import { getBalance, getNativeBalance, getERC20Balance } from '@/utils/balance'
import { isNativeToken, getNetworkByDomainID } from '@/utils'
import { NetworkMetadata } from '@/config/types'

const nomadSDK = await import('@nomad-xyz/sdk-bridge')
const nomad = new nomadSDK.BridgeContext(process.env.VUE_APP_NOMAD_ENVIRONMENT)

export interface SendData {
  isNative: boolean
  originNetwork: number
  destNetwork: number
  asset: TokenIdentifier
  amnt: number
  recipient: string
  gasLimit?: number
}

export interface SDKState {
  balance: BigNumber | null
  sending: boolean
  blacklist: Set<number>
}

const state: SDKState = {
  balance: null,
  sending: false,
  blacklist: new Set(),
}

const mutations = <MutationTree<SDKState>>{
  [types.SET_BALANCE](state: SDKState, balance: BigNumber | null) {
    console.log('{dispatch} set balance: ', balance)
    state.balance = balance
  },

  [types.SET_SENDING](state: SDKState, sending: boolean) {
    console.log('{dispatch} transaction send in process: ', sending)
    state.sending = sending
  },

  [types.SET_BLACKLIST](state: SDKState, blacklist: Set<number>) {
    console.log('{dispatch} set blacklist: ', blacklist)
    state.blacklist = blacklist
  },
}

const actions = <ActionTree<SDKState, RootState>>{
  async instantiateNomad({ dispatch }) {
    Object.values(networks).forEach(({ name, rpcUrl }) => {
      nomad.registerRpcProvider(name, rpcUrl)
    })
    if (isProduction) {
      nomad.registerRpcProvider('xdai', process.env.VUE_APP_XDAI_RPC)
    }
    console.log('nomad instantiated: ', nomad)
    await dispatch('checkFailedHomes')
  },
  async checkFailedHomes({ commit }) {
    await nomad.checkHomes(Object.keys(networks))
    const blacklist = nomad.blacklist()
    console.log('blacklist', blacklist)
    commit(types.SET_BLACKLIST, blacklist)
  },

  async getBalanceFromWallet({ rootState, commit }) {
    console.log('gettingbalanceFromwallet')

    // if not on supported network, don't get balance
    if (!rootState.userInput.originNetwork) return

    // get current network domain
    const networkName = rootState.userInput.originNetwork
    const network = networks[networkName]
    const domain = network.domainID
    const address = rootState.wallet.address
    const token = rootState.userInput.token

    let balance
    if (token.nativeNetwork === networkName) {
      if (isNativeToken(networkName, token)) {
        console.log('getting native token balance')
        try {
          balance = await getNativeBalance(nomad, network.name, address)
        } catch (e) {
          balance = 0
          console.error(e)
          console.log(`no balance for ${token.name}`)
        }
      } else {
        console.log('getting balance of ERC20 token: ', token.name)
        if (!token.tokenIdentifier) {
          throw new Error('Native token, no token identifier')
        }
        const provider = nomad.getProvider(network.name)
        try {
          balance = await getERC20Balance(
            provider as providers.Web3Provider,
            token.tokenIdentifier.id as string,
            address
          )
        } catch (e) {
          balance = 0
          console.error(e)
          console.log(`no balance for ${token.name}`)
        }
      }
    } else {
      console.log('getting representational token balance')
      if (!token.tokenIdentifier) {
        throw new Error('Native token, no token identifier')
      }
      try {
        balance = await getBalance(
          nomad,
          token.tokenIdentifier,
          address,
          domain
        )
      } catch (e) {
        // there is no balance so it errors
        // should return 0
        balance = 0
        console.error(e)
        console.log(`no balance for ${token.name}`)
      }
    }

    commit(types.SET_BALANCE, balance)
  },

  registerSigner(_, network: NetworkMetadata) {
    console.log('registering signer for ', network)
    const networkName = network.name
    const provider = new providers.Web3Provider(window.ethereum)
    const newSigner = provider.getSigner()

    nomad.clearSigners()
    nomad.missingProviders
      .map((numberString) => parseInt(numberString))
      .forEach((domain: number) => {
        const network = getNetworkByDomainID(domain)
        nomad.registerRpcProvider(networkName, network.rpcUrl)
      })

    nomad.registerSigner(networkName, newSigner)
  },

  async send(
    { commit, dispatch },
    payload: SendData
  ): Promise<TransferMessage | null> {
    console.log('sending...', payload)
    commit(types.SET_SENDING, true)
    const { isNative, originNetwork, destNetwork, asset, amnt, recipient } =
      payload

    const originDomain = nomad.resolveDomain(originNetwork)
    const destDomain = nomad.resolveDomain(destNetwork)

    let transferMessage
    try {
      // if ETH Helper contract exists, native token must be wrapped
      // before sending, use sendNative
      const ethHelper = nomad.getBridge(originDomain)?.ethHelper
      if (ethHelper && isNative) {
        console.log('send native')
        transferMessage = await nomad.sendNative(
          originDomain,
          destDomain,
          amnt,
          recipient
        )
      } else {
        console.log('send ERC-20')
        transferMessage = await nomad.send(
          originDomain,
          destDomain,
          asset,
          amnt,
          recipient
        )
      }
      console.log('tx sent!!!!!!!!!!!!', transferMessage)
      commit(types.SET_SENDING, false)
      return transferMessage
    } catch (e) {
      await dispatch('checkFailedHomes')
      console.error(e)
    }

    commit(types.SET_SENDING, false)
    return null
  },
  async processTx({ dispatch }, txId: string) {
    // get transfer message
    const res = await fetch(`${nomadAPI}${txId}`)
    const tx = (await res.json())[0]

    // switch network
    const originNetwork = getNetworkByDomainID(tx.origin)
    const destNetwork = getNetworkByDomainID(tx.destination)
    await dispatch('switchNetwork', destNetwork.name)
    // register signer
    await dispatch('registerSigner', destNetwork)

    // get proof
    const index = BigNumber.from(tx.leafIndex).toNumber()
    const s3Res = await fetch(`${s3URL}${originNetwork.name}_${index}`)
    const data = await s3Res.json()
    console.log('proof: ', data)

    // get replica contract
    const replica = nomad.getReplicaFor(tx.origin, tx.destination)

    if (!replica) {
      throw new Error('missing replica, unable to process transaction')
    }

    // get signer and connect replica
    const signer = nomad.getSigner(tx.destination)
    if (!signer) {
      throw new Error('missing signer, unable to process transaction')
    }
    replica.connect(signer)

    try {
      // prove and process
      const receipt = await replica.proveAndProcess(
        data.message as BytesLike,
        data.proof.path,
        data.proof.index
      )
      console.log('PROCESSED!!!!')
      return receipt
    } catch (e) {
      await dispatch('checkFailedHomes')
      console.error(e)
    }
  },
}

const getters = <GetterTree<SDKState, RootState>>{
  activeNetworks: (state: SDKState) => () => {
    return Object.keys(networks)
      .filter((n) => !state.blacklist.has(networks[n].domainID))
      .map((n) => networks[n])
  },
  blacklist: (state: SDKState) => () => state.blacklist,
  getGasPrice: () => async (network: string | number) => {
    try {
      const provider = nomad.getProvider(network)
      const gasPrice = await provider?.getGasPrice()
      return gasPrice
    } catch (e) {
      console.error(e)
    }
  },

  getTxMessage:
    () =>
    async (tx: TXData): Promise<TransferMessage | undefined> => {
      const { network, hash } = tx
      let message

      try {
        message = await nomadSDK.TransferMessage.singleFromTransactionHash(
          nomad,
          network,
          hash
        )
      } catch (e) {
        console.error(e)
      }

      return message
    },

  resolveDomain: () => (network: string) => {
    return nomad.resolveDomain(network)
  },

  resolveDomainName: () => (network: number) => {
    return nomad.resolveDomainName(network)
  },

  resolveRepresentation:
    () => async (network: string, token: TokenIdentifier) => {
      return await nomad.resolveRepresentation(network, token)
    },
}

export default {
  state,
  mutations,
  actions,
  getters,
}

import { TokenIdentifier } from '@nomad-xyz/sdk-bridge'

// TODO: derive these string types from the networks
// listed inside the config bridgeGui map
export type MainnetNetwork = 'ethereum' | 'moonbeam' | 'milkomedaC1'
export type TestnetNetwork = 'rinkeby' | 'kovan' | 'goerli' | 'xdai'
export type NetworkName = MainnetNetwork | TestnetNetwork

export type NetworkMap = { [key: string]: NetworkMetadata }

export type TokenMetadata = {
  nativeNetwork: NetworkName
  symbol: string
  name: string
  icon: string
  iconColors?: string[]
  decimals: number
  coinGeckoId: string
  tokenIdentifier: TokenIdentifier | null
  nativeOnly: boolean
  minAmt: number
  wrappedAsset?: string
}

export type NetworkMetadata = {
  name: NetworkName
  displayName: string
  connections: NetworkName[]
  chainID: number // for metamask
  domainID: number // nomad domain ID
  rpcUrl: string
  nativeToken: TokenMetadata
  blockExplorer: string
  icon: string
  confirmationTimeInMinutes: number
}

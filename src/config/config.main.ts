import CeloIcon from '@/assets/token-logos/CELO.png'
import wETHIcon from '@/assets/token-logos/WETH.png'
import USDTIcon from '@/assets/token-logos/USDT.png'
import USDCIcon from '@/assets/token-logos/USDC.png'
import DAIIcon from '@/assets/token-logos/DAI.png'

import { SdkBaseChainConfigParams } from '@connext/nxtp-sdk'

import mainnetTokens from './tokens.main'
import { TokenMetadata, NetworkMetadata } from './config.types'
import representationsMain from './representations.main'

export const tokens: { [key: string]: TokenMetadata } = {
  CELO: {
    nativeNetwork: 'celo',
    symbol: 'CELO',
    name: 'CELO',
    icon: CeloIcon,
    iconColors: ['#EBC05A', '#41C976'],
    decimals: 18,
    coinGeckoId: 'celo',
    tokenIdentifier: mainnetTokens.CELO,
    nativeOnly: false,
    minAmt: 1.8,
  },
  WETH: {
    nativeNetwork: 'ethereum',
    symbol: 'WETH',
    name: 'WETH',
    icon: wETHIcon,
    iconColors: ['#C0CEF7', '#7594EE'],
    decimals: 18,
    coinGeckoId: 'weth',
    tokenIdentifier: mainnetTokens.WETH,
    nativeOnly: false,
    minAmt: 0.0028,
  },
  ETH: {
    nativeNetwork: 'ethereum',
    symbol: 'ETH',
    name: 'ETH',
    icon: wETHIcon,
    iconColors: ['#C0CEF7', '#7594EE'],
    decimals: 18,
    coinGeckoId: 'ethereum',
    tokenIdentifier: mainnetTokens.WETH,
    nativeOnly: true,
    minAmt: 0.0028,
  },
  USDT: {
    nativeNetwork: 'ethereum',
    symbol: 'USDT',
    name: 'USDT',
    icon: USDTIcon,
    iconColors: ['#fff', '#26A17B'],
    decimals: 6,
    coinGeckoId: 'tether',
    tokenIdentifier: mainnetTokens.USDT,
    nativeOnly: false,
    minAmt: 10,
  },
  USDC: {
    nativeNetwork: 'ethereum',
    symbol: 'USDC',
    name: 'USDC',
    icon: USDCIcon,
    iconColors: ['#fff', '#2976C9'],
    decimals: 6,
    coinGeckoId: 'usd-coin',
    tokenIdentifier: mainnetTokens.USDC,
    nativeOnly: false,
    minAmt: 10,
  },
  DAI: {
    nativeNetwork: 'ethereum',
    symbol: 'DAI',
    name: 'DAI',
    icon: DAIIcon,
    iconColors: ['#f0bf54', '#F4B731'],
    decimals: 18,
    coinGeckoId: 'dai',
    tokenIdentifier: mainnetTokens.DAI,
    nativeOnly: false,
    minAmt: 10,
  },
}

export const networks: { [key: string]: NetworkMetadata } = {
  celo: {
    name: 'celo',
    chainID: 42220,
    domainID: 1667591279,
    rpcUrl: 'https://forno.celo.org',
    nativeToken: tokens.CELO,
    blockExplorer: 'https://explorer.celo.org/',
    icon: CeloIcon,
    confirmationTimeInMinutes: 180,
  },
  ethereum: {
    name: 'ethereum',
    chainID: 1,
    domainID: 6648936,
    rpcUrl:
      'https://eth-mainnet.alchemyapi.io/v2/rud551ngiIel2fRYbWmsnhwAE1FGgCLG',
    nativeToken: tokens.ETH,
    blockExplorer: 'https://etherscan.io/',
    icon: wETHIcon,
    confirmationTimeInMinutes: 180,
  },
}

export const representations = representationsMain

export const connextPools: { [key: string]: string[] } = {
  celo: ['WETH', 'USDC', 'USDT', 'DAI'],
  ethereum: ['WETH', 'USDC', 'USDT', 'DAI'],
}

export const connextConfig: SdkBaseChainConfigParams = {
  1: {
    // ethereum mainnet
    providers: [
      'https://eth-mainnet.alchemyapi.io/v2/rud551ngiIel2fRYbWmsnhwAE1FGgCLG',
    ],
  },
  42220: {
    // celo
    providers: ['https://forno.celo.org'],
  },
}

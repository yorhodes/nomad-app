import wETHIcon from '@/assets/token-logos/WETH.png'
import USDTIcon from '@/assets/token-logos/USDT.png'
import USDCIcon from '@/assets/token-logos/USDC.png'
import DAIIcon from '@/assets/token-logos/DAI.png'
import DEVIcon from '@/assets/token-logos/DEV.png'

import { SdkBaseChainConfigParams } from '@connext/nxtp-sdk'

import testnetTokens from './tokens.dev'
import { TokenMetadata, NetworkMetadata } from './config.types'
import representationsDev from './representations.dev'

export const tokens: { [key: string]: TokenMetadata } = {
  WETH: {
    nativeNetwork: 'kovan',
    symbol: 'WETH',
    name: 'Kovan WETH',
    icon: wETHIcon,
    iconColors: ['#C0CEF7', '#7594EE'],
    decimals: 18,
    coinGeckoId: 'weth',
    tokenIdentifier: testnetTokens.WETH,
    nativeOnly: false,
    minAmt: 0.0028,
  },
  ETH: {
    nativeNetwork: 'kovan',
    symbol: 'ETH',
    name: 'Kovan ETH',
    icon: wETHIcon,
    iconColors: ['#C0CEF7', '#7594EE'],
    decimals: 18,
    coinGeckoId: 'ethereum',
    tokenIdentifier: testnetTokens.WETH,
    nativeOnly: true,
    minAmt: 0.0028,
  },
  USDT: {
    nativeNetwork: 'kovan',
    symbol: 'USDT',
    name: 'USDT',
    icon: USDTIcon,
    iconColors: ['#fff', '#26A17B'],
    decimals: 6,
    coinGeckoId: 'tether',
    tokenIdentifier: testnetTokens.USDT,
    nativeOnly: false,
    minAmt: 10,
  },
  USDC: {
    nativeNetwork: 'kovan',
    symbol: 'USDC',
    name: 'USDC',
    icon: USDCIcon,
    iconColors: ['#fff', '#2976C9'],
    decimals: 6,
    coinGeckoId: 'usd-coin',
    tokenIdentifier: testnetTokens.USDC,
    nativeOnly: false,
    minAmt: 10,
  },
  DAI: {
    nativeNetwork: 'kovan',
    symbol: 'DAI',
    name: 'DAI',
    icon: DAIIcon,
    iconColors: ['#f0bf54', '#F4B731'],
    decimals: 18,
    coinGeckoId: 'dai',
    tokenIdentifier: testnetTokens.DAI,
    nativeOnly: false,
    minAmt: 10,
  },
  DEV: {
    nativeNetwork: 'moonbasealpha',
    symbol: 'DEV',
    name: 'Moonbase DEV',
    icon: DEVIcon,
    iconColors: ['#53CBC8', '#e84195'],
    decimals: 18,
    coinGeckoId: 'dai', // TODO:
    tokenIdentifier: testnetTokens.DEV,
    nativeOnly: true,
    minAmt: 10,
  },
}

export const networks: { [key: string]: NetworkMetadata } = {
  kovan: {
    name: 'kovan',
    chainID: 42,
    domainID: 3000,
    nativeToken: tokens.ETH,
    rpcUrl:
      'https://eth-kovan.alchemyapi.io/v2/aJP38P1ZeHbXP3Td8vVh8vFmxkKT9pnR',
    blockExplorer: 'https://kovan.etherscan.io/',
    icon: wETHIcon,
    confirmationTimeInMinutes: 2,
  },
  moonbasealpha: {
    name: 'moonbasealpha',
    chainID: 1287,
    domainID: 5000,
    nativeToken: tokens.DEV,
    rpcUrl: 'https://rpc.api.moonbase.moonbeam.network',
    blockExplorer: 'https://moonbase-blockscout.testnet.moonbeam.network/',
    icon: DEVIcon,
    confirmationTimeInMinutes: 2,
  },
  // TODO: re-add once evmos testnet has been added here (https://github.com/nomad-xyz/nomad-monorepo/blob/main/typescript/nomad-provider/src/nomad/domains/dev.ts)
  // Currently will error otherwise.
  // evmos: {
  //   name: 'Evmos Testnet',
  //   chainID: 9000,
  //   domainID: 2000,
  //   nativeToken: tokens.PHOTON,
  //   rpcUrl: 'https://ethereum.rpc.evmos.dev',
  //   blockExplorer: 'https://evm.evmos.org',
  //   icon: wETHIcon, // TODO: update with correct icon
  //   confirmationTimeInMinutes: 15,
  // },
}

export const representations = representationsDev

export const connextPools: { [key: string]: string[] } = {
  moonbasealpha: [],
  kovan: ['WETH', 'USDC', 'USDT', 'DAI'],
}

export const connextConfig: SdkBaseChainConfigParams = {
  // must have Ethereum for some reason
  1: {
    // ethereum mainnet
    providers: [
      'https://eth-mainnet.alchemyapi.io/v2/rud551ngiIel2fRYbWmsnhwAE1FGgCLG',
    ],
  },
  42: {
    // kovan
    providers: [
      'https://eth-kovan.alchemyapi.io/v2/aJP38P1ZeHbXP3Td8vVh8vFmxkKT9pnR',
    ],
  },
  4: {
    // rinkeby
    providers: [
      'https://eth-rinkeby.alchemyapi.io/v2/uOf-lO18qM7rAT6NOgMAZQoyuS__lhqN',
    ],
  },
  5: {
    // goerli
    providers: [
      'https://eth-goerli.alchemyapi.io/v2/imWPm8YYzUT-hocpV1Wtqu5HLgMHVpNU',
    ],
  },
}

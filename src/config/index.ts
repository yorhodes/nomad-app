import * as dev from './config.dev'
import * as main from './config.main'
import { TokenMetadata, NetworkMetadata } from './config.types'
import { SdkBaseChainConfigParams } from '@connext/nxtp-sdk'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const environment = process.env.VUE_APP_NOMAD_ENVIRONMENT
const currentEnv = chooseConfig(environment)
export const isProduction = environment === 'production'

export const tokens = currentEnv.tokens
export const networks = currentEnv.networks
export const connextConfig = currentEnv.connextConfig
export const walletConnectRPCConfig = currentEnv.walletConnectRPCConfig
export const connextPools = currentEnv.connextPools
export const hubNetwork = currentEnv.hubNetwork
export const s3URL = isProduction
  ? 'https://nomadxyz-production-proofs.s3.us-west-2.amazonaws.com/'
  : 'https://nomadxyz-development-proofs.s3.us-west-2.amazonaws.com/'
export const connextScanURL = isProduction
  ? 'https://connextscan.io/'
  : 'https://testnet.connextscan.io/'
// TODO: add production URL
export const nomadAPI = isProduction
  ? ''
  : 'https://bridge-indexer.dev.madlads.tools/tx'
export const BUFFER_CONFIRMATION_TIME_IN_MINUTES = isProduction ? 25 : 5
export const PROCESS_TIME_IN_MINUTES = isProduction ? 10 : 2

function chooseConfig(environment: string | undefined): {
  tokens: { [key: string]: TokenMetadata }
  networks: { [key: string]: NetworkMetadata }
  connextConfig: SdkBaseChainConfigParams
  walletConnectRPCConfig: Record<number, string>
  connextPools: { [key: string]: string[] }
  hubNetwork: NetworkMetadata
} {
  console.log('Env: ', environment)
  switch (environment) {
    case 'development':
      return dev

    case 'staging':
      return dev

    case 'production':
      return main

    default:
      return dev
  }
}

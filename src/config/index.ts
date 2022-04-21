import { SdkBaseChainConfigParams } from '@connext/nxtp-sdk'
import { NomadConfig } from '@nomad-xyz/configuration'
import { testnetTokens, mainnetTokens } from './tokens'
import { NetworkMetadata, NetworkMap } from './types'

const environment = process.env.VUE_APP_NOMAD_ENVIRONMENT

// TODO: look into how await import works, might be better
// to move to a single file where we import configuration
// and then just export to use everywhere else
const configuration = await import('@nomad-xyz/configuration')
const config = configuration.getBuiltin(environment!)
const ethereumRPCs = configuration.getBuiltin('production').rpcs.ethereum

export const isProduction = environment === 'production'

export const tokens = isProduction ? mainnetTokens : testnetTokens
export const networks = getNetworksFromConfig(config)
export const connextConfig = getConnextConfigFromConfig(config, ethereumRPCs)

export const s3URL = isProduction
  ? 'https://nomadxyz-production-proofs.s3.us-west-2.amazonaws.com/'
  : 'https://nomadxyz-development-proofs.s3.us-west-2.amazonaws.com/'
export const connextScanURL = isProduction
  ? 'https://connextscan.io/'
  : 'https://testnet.connextscan.io/'
export const nomadAPI = isProduction
  ? 'https://bridge-indexer.prod.madlads.tools/tx/'
  : 'https://bridge-indexer.dev.madlads.tools/tx/'
export const BUFFER_CONFIRMATION_TIME_IN_MINUTES = isProduction ? 25 : 5
export const PROCESS_TIME_IN_MINUTES = isProduction ? 10 : 2

// TODO: move these helper functions to a utils file and export for testing

function getConnextConfigFromConfig(
  config: NomadConfig,
  ethereumRPCs: string[]
): SdkBaseChainConfigParams {
  const connextConfig: SdkBaseChainConfigParams = {}

  Object.keys(config.bridgeGui).forEach((networkName) => {
    // TODO: add field to bridgeGui object
    if (config.bridgeGui[networkName].connextEnabled) {
      const { chainId } = config.protocol.networks[networkName].specs

      connextConfig[chainId] = {
        providers: config.rpcs[networkName],
      }
    }
  })

  if (!connextConfig[1]) {
    // must have Ethereum for some reason
    connextConfig[1] = {
      providers: ethereumRPCs,
    }
  }

  return connextConfig
}

function getNetworksFromConfig(config: NomadConfig): NetworkMap {
  const networks: NetworkMap = {}

  Object.keys(config.bridgeGui).forEach((networkName) => {
    // TODO: add separate connections field to bridgeGui object
    const { displayName, nativeTokenSymbol, connections, manualProcessing } =
      config.bridgeGui[networkName]
    const nativeToken = tokens[nativeTokenSymbol]
    const { name, domain: domainID } = config.protocol.networks[networkName]
    const { chainId: chainID, blockExplorer } =
      config.protocol.networks[networkName].specs
    const rpcUrl = config.rpcs[networkName][0] // only 1 supported at the moment in the sdk
    const { optimisticSeconds } =
      config.protocol.networks[networkName].configuration
    const confirmationTimeInMinutes = (optimisticSeconds as number) / 60
    const icon = nativeToken.icon

    networks[networkName] = {
      icon,
      name,
      rpcUrl,
      chainID,
      domainID,
      displayName,
      nativeToken,
      connections,
      blockExplorer,
      manualProcessing,
      confirmationTimeInMinutes,
    } as NetworkMetadata
  })

  return networks
}

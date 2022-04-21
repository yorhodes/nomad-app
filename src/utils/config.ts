import { SdkBaseChainConfigParams } from '@connext/nxtp-sdk'
import { NomadConfig } from '@nomad-xyz/configuration'
import { NetworkMetadata, NetworkMap, TokenMetadataMap } from '@/config/types'

export const getConnextConfigFromConfig = (
  config: NomadConfig,
  ethereumRPCs: string[]
): SdkBaseChainConfigParams => {
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

export const getNetworksFromConfig = (
  config: NomadConfig,
  tokens: TokenMetadataMap
): NetworkMap => {
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

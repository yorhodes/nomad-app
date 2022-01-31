import { providers } from 'ethers'
import { NxtpSdk } from '@connext/nxtp-sdk'
import { Logger } from '@connext/nxtp-utils'

import { connextConfig, isProduction } from '@/config'
import {
  MainnetNetwork,
  TestnetNetwork,
  TokenMetadata,
} from '@/config/config.types'
import { getWalletProvider } from './wallet'

export type SwapData = {
  origin: MainnetNetwork | TestnetNetwork
  destination: MainnetNetwork | TestnetNetwork
  destinationAddress: string
  token: TokenMetadata
  amount: number
}

export default async function instantiateConnextSDK(): Promise<NxtpSdk> {
  const provider = await getWalletProvider()
  const _signer = await provider.getSigner()

  // Level can be one of:
  // 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'
  // silenced in production
  const logger = new Logger({
    name: 'shuturface',
    level: isProduction ? 'silent' : 'warn',
  })

  // Instantiate SDK
  const sdk = await NxtpSdk.create({
    chainConfig: connextConfig,
    signer: _signer,
    logger,
  })

  return sdk
}

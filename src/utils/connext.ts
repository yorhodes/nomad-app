import { ethers, utils, providers } from 'ethers'
import { NxtpSdk, NxtpSdkEvents } from '@connext/nxtp-sdk'
// import { Logger } from '@connext/nxtp-utils'

import { connextConfig } from '@/config'
import { MainnetNetwork, TestnetNetwork, TokenMetadata } from '@/config/config.types'

export type SwapData = {
  origin: MainnetNetwork | TestnetNetwork;
  destination: MainnetNetwork | TestnetNetwork;
  destinationAddress: string;
  token: TokenMetadata;
  amount: number;
}

export default async function instantiateConnextSDK(): Promise<NxtpSdk> {
  // Get signer from metamask
  const { ethereum } = window

  try {
    await ethereum.request({ method: 'eth_requestAccounts' })
  } catch (e) {
    console.error(e)
    throw new Error('Couldn\'t connect to metamask')
  }

  const provider = new providers.Web3Provider(ethereum)
  const _signer = provider.getSigner()

  // Level can be one of:
  // 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'
  // const logger = new Logger({ name: 'shuturface', level: 'silent' })

  // Instantiate SDK
  try {
    const sdk = await NxtpSdk.create({
      chainConfig: connextConfig,
      signer: _signer,
    })
    console.log('sdk', sdk)

    // set up event listeners
    sdk.attach(NxtpSdkEvents.SenderTransactionPrepared, (data) => {
      console.log("!!SenderTransactionPrepared:", data)
    })
    sdk.attach(NxtpSdkEvents.SenderTransactionFulfilled, (data) => {
      console.log("!!SenderTransactionFulfilled:", data)
    })
    sdk.attach(NxtpSdkEvents.SenderTransactionCancelled, (data) => {
      console.log("!!SenderTransactionCancelled:", data)
    })
    sdk.attach(NxtpSdkEvents.ReceiverTransactionPrepared, (data) => {
      console.log("!!ReceiverTransactionPrepared:", data)
    })
    sdk.attach(NxtpSdkEvents.ReceiverTransactionFulfilled, async (data) => {
      console.log("!!ReceiverTransactionFulfilled:", data)
    })
    sdk.attach(NxtpSdkEvents.ReceiverTransactionCancelled, (data) => {
      console.log("!!ReceiverTransactionCancelled:", data)
    })
    sdk.attach(NxtpSdkEvents.SenderTokenApprovalMined, (data) => {
      console.log("!!SenderTokenApprovalMined:", data)
    })
    sdk.attach(NxtpSdkEvents.SenderTransactionPrepareSubmitted, (data) => {
      console.log("!!SenderTransactionPrepareSubmitted:", data)
    })

    return sdk
  } catch (e) {
    throw new Error('Could\'t setup connext')
  }
}

// The test tokens are collateralized by routers on the test network, so swap requests
// should always be successful when using these assets.
//
// Instructions:
// 1. Go to network
// 2. `await mintTestERC20(yourWalletAddress)`
export async function mintTestERC20(address: string, signer?: ethers.Signer) {
  let _signer
  if (signer) {
    _signer = signer
  } else {
    // Get signer from metamask
    const { ethereum } = window

    try {
      await ethereum.request({ method: 'eth_requestAccounts' })
    } catch (e) {
      console.error(e)
      throw new Error('Couldn\'t connect to metamask')
    }

    const provider = new providers.Web3Provider(ethereum)
    _signer = provider.getSigner()
  }

  let response

  try {
    // get TestERC20 contracts
    response = await fetch(
      'https://raw.githubusercontent.com/connext/nxtp/main/packages/contracts/deployments.json'
    )
  } catch (e) {
    throw new Error('Couldn\'t fetch ERC20 contracts')
  }

  let deployments
  try {
    deployments = await response.json()
  } catch (e) {
    throw new Error('Couldn\'t parse ERC20 contracts')
  }

  const { address: rAddress, abi: rAbi } =
    deployments['4'].rinkeby.contracts.TestERC20
  const { address: kAddress, abi: kAbi } =
    deployments['42'].kovan.contracts.TestERC20
  const rinkebyTestERC20 = new ethers.Contract(rAddress, rAbi, _signer)
  const kovanTestERC20 = new ethers.Contract(kAddress, kAbi, _signer)

  // get 10 test token
  const amt = utils.parseEther('100')
  await rinkebyTestERC20.mint(address, amt)
  await kovanTestERC20.mint(address, amt)
  console.log('complete')
}

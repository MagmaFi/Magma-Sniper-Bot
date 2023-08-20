import { JsonRpcProvider } from '@ethersproject/providers'

export default class RpcClient {
  chainId: number
  rpcUrl: string
  provider: JsonRpcProvider

  constructor(provider: JsonRpcProvider) {
    this.chainId = provider.network.chainId
    this.provider = provider
    this.rpcUrl = provider.connection.url

    console.log('[Info] Client', this.chainId, this.rpcUrl)
  }
}

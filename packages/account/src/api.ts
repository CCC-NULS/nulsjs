import {RpcApiService, ChainId, ApiServiceConfig} from '@nuls/core'

export interface AccountBalance {
  totalBalance: number
  balance: number
  timeLock: number
  consensusLock: number
  freeze: number
  nonce: string
  nonceType: number
}

export class AccountApi {
  protected _rpc: RpcApiService

  public constructor(
    config?: ApiServiceConfig,
    rpc: RpcApiService = new RpcApiService(config),
  ) {
    this._rpc = rpc
  }

  public async getBalance(
    address: string,
    chainId: ChainId,
    assetId: number,
  ): Promise<AccountBalance> {
    const res = await this._rpc.call(
      'getAccountBalance',
      [chainId, assetId, address],
      chainId,
    )
    if (res.ok) {
      return res.data
    } else {
      throw new Error(JSON.stringify(res.error))
    }
  }
}

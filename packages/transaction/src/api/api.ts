import {
  RpcApiService,
  ChainId,
  ApiServiceConfig,
  CommonNulsApiListResponse,
  CommonSuccessResponseBody,
  TransactionType,
} from '@nuls.io/core'
import {CommonTxListItem, TxInfo} from './model'

export interface ValidateTxResponse {
  value: string
}

export interface BroadcastTxResponse {
  value: boolean
  hash: string
}

export interface TransactionListResponseData extends CommonNulsApiListResponse {
  list: CommonTxListItem[]
}

export interface TransactionListResponse extends CommonSuccessResponseBody {
  ok: true
  data: TransactionListResponseData
}

export interface TransactionResponse extends CommonSuccessResponseBody {
  ok: true
  data: TxInfo
}

export class TransactionApi {
  public constructor(
    config?: ApiServiceConfig,
    protected _rpc: RpcApiService = new RpcApiService(config),
  ) {}

  public async getTransactions(
    type: TransactionType = 0,
    pageNumber: number = 1,
    pageSize: number = this._rpc.config.maxPagesize,
    isHiddenRewards: boolean = false,
  ): Promise<TransactionListResponse> {
    return this._rpc.call('getTxList', [
      pageNumber,
      pageSize,
      type,
      isHiddenRewards,
    ]) as Promise<TransactionListResponse>
  }

  public async getTransaction(txHash: string): Promise<TransactionResponse> {
    return this._rpc.call('getTx', [txHash]) as Promise<TransactionResponse>
  }

  public async validateTransaction(txHex: string): Promise<ValidateTxResponse> {
    const res = await this._rpc.call('validateTx', [txHex])
    if (res.ok) {
      return res.data
    } else {
      throw new Error(JSON.stringify(res.error))
    }
  }

  public async broadcast(txHex: string): Promise<BroadcastTxResponse> {
    const res = await this._rpc.call('broadcastTx', [txHex])
    if (res.ok) {
      return res.data
    } else {
      throw new Error(JSON.stringify(res.error))
    }
  }
}

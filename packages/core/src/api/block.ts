import {CommonNulsApiListResponse} from './model'
import {CommonSuccessResponseBody, ApiServiceConfig} from './api'
import {RpcApiService} from './rpc'
import {ChainId} from '../common'

export interface BlockHeaderListItem {
  height: number
  createTime: number
  txCount: number
  agentHash: string
  agentId: string
  agentAlias: string
  size: number
  reward: number
}

export interface BlockHeaderListResponseData extends CommonNulsApiListResponse {
  list: BlockHeaderListItem[]
}

export interface BlockHeaderListResponse extends CommonSuccessResponseBody {
  ok: true
  data: BlockHeaderListResponseData
}

export interface BlockListItem {
  header: {
    hash: string
    height: number
    preHash: string
    merkleHash: string
    createTime: number
    agentHash: string
    agentId: string
    packingAddress: string
    agentAlias: null
    txCount: number
    roundIndex: number
    totalFee: number
    reward: number
    size: number
    packingIndexOfRound: number
    scriptSign: string
    txHashList: string[]
    roundStartTime: number
    agentVersion: number
    seedPacked: false
  }
  txList: {
    hash: string
    type: number
    height: number
    size: number
    fee: {
      chainId: number
      assetId: number
      symbol: string
      value: number
    }
    createTime: number
    remark: null
    txDataHex: null
    txData: null
    txDataList: null
    coinFroms: []
    coinTos: {
      address: string
      chainId: number
      assetsId: number
      amount: number
      lockTime: number
      symbol: string
      assetKey: string
    }[]
    value: number
    status: number
  }[]
  blockHex: string
}

export interface BlockResponse extends CommonSuccessResponseBody {
  ok: true
  data: BlockListItem
}

export class BlockApi {
  public constructor(
    config?: ApiServiceConfig,
    protected _rpc: RpcApiService = new RpcApiService(config),
  ) {}

  public async getBlockHeaders(
    packingAddress: string = '',
    pageNumber: number = 1,
    pageSize: number = this._rpc.config.maxPagesize,
    isHiddenRewards: boolean = false,
  ): Promise<BlockHeaderListResponse> {
    return this._rpc.call('getBlockHeaderList', [
      pageNumber,
      pageSize,
      isHiddenRewards,
      packingAddress,
    ]) as Promise<BlockHeaderListResponse>
  }

  public async getBlock(blockHeight: number): Promise<BlockResponse> {
    return this._rpc.call('getBlockByHeight', [blockHeight]) as Promise<
      BlockResponse
    >
  }
}

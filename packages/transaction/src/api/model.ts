import {TransactionType} from '@nuls.io/core'

export interface CommonTxListItem {
  txHash: string
  address: string
  type: TransactionType
  createTime: number
  height: number
  chainId: number
  assetId: number
  symbol: string
  values: number
  fee: {
    chainId: number
    assetId: number
    symbol: string
    value: number
  }
  balance: number
  transferType: number
  status: number
}

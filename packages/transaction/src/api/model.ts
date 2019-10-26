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

export interface TxInfo {
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
  remark: string
  txDataHex: string
  txData: {
    txHash: string
    agentId: string
    agentAddress: string
    packingAddress: string
    rewardAddress: string
    agentAlias: string
    deposit: number
    commissionRate: number
    createTime: number
    status: number
    totalDeposit: number
    depositCount: number
    creditValue: number
    totalPackingCount: number
    lostRate: number
    lastRewardHeight: number
    deleteHash: string
    blockHeight: number
    deleteHeight: number
    totalReward: number
    commissionReward: number
    agentReward: number
    roundPackingTime: number
    yellowCardCount: number
    version: number
    type: number
    new: boolean
  }
  txDataList: any[]
  coinFroms: [
    {
      address: string
      chainId: number
      assetsId: number
      amount: number
      locked: number
      nonce: string
      symbol: string
      assetKey: string
    },
  ]
  coinTos: [
    {
      address: string
      chainId: number
      assetsId: number
      amount: number
      lockTime: number
      symbol: string
      assetKey: string
    },
  ]
  value: number
  status: number
}

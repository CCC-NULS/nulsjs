import {BaseTxData} from './baseTxData'
import {NulsSerializer, NulsParser} from '@nuls.io/core'

export interface NodeRegisterTxDataObject {
  deposit: number
  agentAddress: string
  packingAddress: string
  rewardAddress: string
  commissionRate: number
}

export class NodeRegisterTxData extends BaseTxData {
  public constructor(
    public _deposit: number = 0,
    public _agentAddress: string = '',
    public _packingAddress: string = '',
    public _rewardAddress: string = '',
    public _commissionRate: number = 0,
  ) {
    super()
  }

  public fromBytes(bytes: Buffer): NodeRegisterTxData {
    const parser = new NulsParser(bytes)
    this._deposit = parser.readBigInt().toNumber()
    this._agentAddress = parser.readAddress()
    this._packingAddress = parser.readAddress()
    this._rewardAddress = parser.readAddress()
    this._commissionRate = parser.readUInt(1)
    return this
  }

  public toObject(): NodeRegisterTxDataObject {
    return {
      deposit: this._deposit,
      agentAddress: this._agentAddress,
      packingAddress: this._packingAddress,
      rewardAddress: this._rewardAddress,
      commissionRate: this._commissionRate,
    }
  }

  public toBytes(): Buffer {
    return new NulsSerializer()
      .writeBigInt(this._deposit)
      .writeAddress(this._agentAddress)
      .writeAddress(this._packingAddress)
      .writeAddress(this._rewardAddress)
      .writeUInt(this._commissionRate, 1)
      .toBuffer()
  }
}

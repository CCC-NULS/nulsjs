import {BaseTxData} from './baseTxData'
import {NulsSerializer, NulsParser} from '@nuls.io/core'

export interface DepositTxDataObject {
  deposit: number
  address: string
  agentHash: string
}

export class DepositTxData extends BaseTxData {
  public constructor(
    public _deposit: number = 0,
    public _address: string = '',
    public _agentHash: string = '',
  ) {
    super()
  }

  public fromBytes(bytes: Buffer): DepositTxData {
    const parser = new NulsParser(bytes)
    this._deposit = parser.readBigInt().toNumber()
    this._address = parser.readAddress()
    this._agentHash = parser.readHash()
    return this
  }

  public toObject(): DepositTxDataObject {
    return {
      deposit: this._deposit,
      address: this._address,
      agentHash: this._agentHash,
    }
  }

  public toBytes(): Buffer {
    return new NulsSerializer()
      .writeBigInt(this._deposit)
      .writeAddress(this._address)
      .writeHash(this._agentHash)
      .toBuffer()
  }
}

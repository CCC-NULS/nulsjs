import {BaseTxData} from './baseTxData'
import {NulsSerializer, NulsParser} from '@nuls.io/core'

export interface DepositTxDataObject {
  deposit: number
  address: string
  nodeHash: string
}

export class DepositTxData implements BaseTxData {
  public constructor(
    public _deposit: number = 0,
    public _address: string = '',
    public _nodeHash: string = '',
  ) {}

  public fromBytes(bytes: Buffer): DepositTxData {
    const parser = new NulsParser(bytes)
    this._deposit = parser.readBigInt().toNumber()
    this._address = parser.readAddress()
    this._nodeHash = parser.readHash()
    return this
  }

  public toObject(): DepositTxDataObject {
    return {
      deposit: this._deposit,
      address: this._address,
      nodeHash: this._nodeHash,
    }
  }

  public toBytes(): Buffer {
    return new NulsSerializer()
      .writeBigInt(this._deposit)
      .writeAddress(this._address)
      .writeHash(this._nodeHash)
      .toBuffer()
  }
}

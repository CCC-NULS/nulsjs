import {BaseTxData} from './baseTxData'
import {NulsSerializer, NulsParser} from '@nuls.io/core'

export interface DepositCancelTxDataObject {
  depositHash: string
}

export class DepositCancelTxData extends BaseTxData {
  public constructor(public _depositHash: string = '') {
    super()
  }

  public fromBytes(bytes: Buffer): DepositCancelTxData {
    const parser = new NulsParser(bytes)
    this._depositHash = parser.readHash()
    return this
  }

  public toObject(): DepositCancelTxDataObject {
    return {
      depositHash: this._depositHash,
    }
  }

  public toBytes(): Buffer {
    return new NulsSerializer().writeHash(this._depositHash).toBuffer()
  }
}

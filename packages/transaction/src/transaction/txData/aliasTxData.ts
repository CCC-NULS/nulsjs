import {BaseTxData} from './baseTxData'
import {NulsSerializer, NulsParser} from '@nuls.io/core'

export interface AliasTxDataObject {
  address: string
  alias: string
}

export class AliasTxData extends BaseTxData {
  public constructor(public _address: string = '', public _alias: string = '') {
    super()
  }

  public fromBytes(bytes: Buffer): AliasTxData {
    const parser = new NulsParser(bytes)
    this._address = parser.readAddressWithLength()
    this._alias = parser.readString()
    return this
  }

  public toObject(): AliasTxDataObject {
    return {
      address: this._address,
      alias: this._alias,
    }
  }

  public toBytes(): Buffer {
    return new NulsSerializer()
      .writeAddressWithLength(this._address)
      .writeString(this._alias)
      .toBuffer()
  }
}

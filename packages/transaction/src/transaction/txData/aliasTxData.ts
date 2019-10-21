import {BaseTxData} from './baseTxData'
import {NulsSerializer, Address, NulsParser} from '@nuls.io/core'

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

    const addressBytes = parser.readBytesWithLength()
    const address = Address.fromBytes(addressBytes).address

    const alias = parser.readString()

    this._address = address
    this._alias = alias

    return this
  }

  public toObject(): AliasTxDataObject {
    return {
      address: this._address,
      alias: this._alias,
    }
  }

  public toBytes(): Buffer {
    const addressBytes = Address.fromString(this._address).toBytes()

    return new NulsSerializer()
      .writeBytesWithLength(addressBytes)
      .writeString(this._alias)
      .toBuffer()
  }
}

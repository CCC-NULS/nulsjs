import {BaseTxData} from './baseTxData'
import {NulsSerializer, NulsParser} from '@nuls.io/core'
import {ContractTxDataObject, ContractTxData} from './contractTxData'

export interface ContractCreateTxDataObject extends ContractTxDataObject {
  contractCode: string
  alias: string
}

export class ContractCreateTxData extends ContractTxData implements BaseTxData {
  public constructor(
    public _contractCode: string = '',
    public _alias: string = '',
  ) {
    super()
  }

  public fromBytes(bytes: Buffer): ContractCreateTxData {
    const parser = new NulsParser(bytes)

    super.senderFromBytes(parser)
    super.contractAddressFromBytes(parser)

    this._contractCode = parser.readBytesWithLength().toString('hex')
    this._alias = parser.readString()

    super.gasLimitFromBytes(parser)
    super.gasPriceFromBytes(parser)
    super.argsFromBytes(parser)

    return this
  }

  public toObject(): ContractCreateTxDataObject {
    const obj = super.toObject()

    return {
      ...obj,
      contractCode: this._contractCode,
      alias: this._alias,
    }
  }

  public toBytes(): Buffer {
    const serial = new NulsSerializer()

    super.senderToBytes(serial)
    super.contractAddressToBytes(serial)

    serial.writeBytesWithLength(Buffer.from(this._contractCode, 'hex'))
    serial.writeString(this._alias)

    super.gasLimitToBytes(serial)
    super.gasPriceToBytes(serial)
    super.argsToBytes(serial)

    return serial.toBuffer()
  }
}

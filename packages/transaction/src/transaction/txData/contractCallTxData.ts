import {BaseTxData} from './baseTxData'
import {NulsSerializer, NulsParser} from '@nuls.io/core'
import {ContractTxDataObject, ContractTxData} from './contractTxData'

export interface ContractCallTxDataObject extends ContractTxDataObject {
  value: number
  methodName: string
  methodDesc: string
}

export class ContractCallTxData extends ContractTxData implements BaseTxData {
  public constructor(
    public _value: number = 0,
    public _methodName: string = '',
    public _methodDesc: string = '',
  ) {
    super()
  }

  public fromBytes(bytes: Buffer): ContractCallTxData {
    const parser = new NulsParser(bytes)

    super.senderFromBytes(parser)
    super.contractAddressFromBytes(parser)

    this._value = parser.readBigInt().toNumber()

    super.gasLimitFromBytes(parser)
    super.gasPriceFromBytes(parser)

    this._methodName = parser.readString()
    this._methodDesc = parser.readString()

    super.argsFromBytes(parser)

    return this
  }

  public toObject(): ContractCallTxDataObject {
    const obj = super.toObject()

    return {
      ...obj,
      value: this._value,
      methodName: this._methodName,
      methodDesc: this._methodDesc,
    }
  }

  public toBytes(): Buffer {
    const serial = new NulsSerializer()

    super.senderToBytes(serial)
    super.contractAddressToBytes(serial)

    serial.writeBigInt(this._value)

    super.gasLimitToBytes(serial)
    super.gasPriceToBytes(serial)

    serial.writeString(this._methodName)
    serial.writeString(this._methodDesc)

    super.argsToBytes(serial)

    return serial.toBuffer()
  }
}

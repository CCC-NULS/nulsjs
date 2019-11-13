import {BaseTxData} from './baseTxData'
import {NulsSerializer, NulsParser} from '@nuls.io/core'
import {ContractTxDataBase, ContractTxDataBaseObject} from './contractTxData'

export type ContractDeleteTxDataObject = ContractTxDataBaseObject

export class ContractDeleteTxData extends ContractTxDataBase
  implements BaseTxData {
  public fromBytes(bytes: Buffer): ContractDeleteTxData {
    const parser = new NulsParser(bytes)

    super.senderFromBytes(parser)
    super.contractAddressFromBytes(parser)

    return this
  }

  public toObject(): ContractDeleteTxDataObject {
    return super.toObject()
  }

  public toBytes(): Buffer {
    const serial = new NulsSerializer()

    super.senderToBytes(serial)
    super.contractAddressToBytes(serial)

    return serial.toBuffer()
  }
}

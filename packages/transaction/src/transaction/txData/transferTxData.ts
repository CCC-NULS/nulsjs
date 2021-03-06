import {BaseTxData} from './baseTxData'

export type TransferTxDataObject = null

export class TransferTxData extends BaseTxData {
  public fromBytes(bytes: Buffer): TransferTxData {
    return this
  }

  public toObject(): TransferTxDataObject {
    return null
  }

  public toBytes(): Buffer {
    return Buffer.from([])
  }
}

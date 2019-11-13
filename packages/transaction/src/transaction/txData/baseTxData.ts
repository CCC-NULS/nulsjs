export type TxDataObject = any

export interface BaseTxData {
  fromBytes(bytes: Buffer): BaseTxData
  toObject(): TxDataObject
  toBytes(): Buffer
}

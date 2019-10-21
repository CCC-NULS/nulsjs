export type TxDataObject = any

export abstract class BaseTxData {
  public abstract fromBytes(bytes: Buffer): BaseTxData
  public abstract toObject(): TxDataObject
  public abstract toBytes(): Buffer
}

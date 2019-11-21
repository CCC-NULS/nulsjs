import {BlockHeader, BlockHeaderObject} from './blockHeader'
import {
  BaseTransaction,
  TransactionObject,
  Transaction,
} from '@nuls.io/transaction'
import {NulsParser, ChainId, NulsSerializer} from '@nuls.io/core'

export interface BlockObject {
  blockHeader: BlockHeaderObject
  transactions: TransactionObject[]
}

export class Block {
  protected _header: BlockHeader = new BlockHeader()
  protected _transactions: BaseTransaction[] = []

  public static fromBytes(
    bytes: Buffer | string,
    chainId: ChainId = ChainId.Mainnet,
  ): Block {
    if (typeof bytes === 'string') {
      bytes = Buffer.from(bytes, 'base64')
    }

    const parser = new NulsParser(bytes)
    const block = new Block()

    block._header = BlockHeader.fromBytes(parser, chainId)
    const txCount = block._header.getTxCount()

    const transactions: BaseTransaction[] = []

    for (let i = 0; i < txCount; i++) {
      const tx: BaseTransaction = Transaction.fromBytes(parser)
      transactions.push(tx)
    }

    block._transactions = transactions

    return block
  }

  public async toBytes(): Promise<Buffer> {
    const serial = new NulsSerializer().write(this._header.toBytes())

    for (let i = 0; i < this._header.getTxCount(); i++) {
      const txBytes = await this._transactions[i].toBytes()
      serial.write(txBytes)
    }

    return serial.toBuffer()
  }

  public async toObject(): Promise<BlockObject> {
    const blockHeader: BlockHeaderObject = this._header.toObject()
    const transactions: TransactionObject[] = await Promise.all(
      this._transactions.map(tx => tx.toObject()),
    )

    return {
      blockHeader,
      transactions,
    }
  }

  public sign(privateKey: string): this {
    this._header.sign(privateKey)
    return this
  }

  public async serialize(): Promise<string> {
    return (await this.toBytes()).toString('hex')
  }

  public async size(): Promise<number> {
    const bytes = await this.toBytes()
    return bytes.length
  }
}

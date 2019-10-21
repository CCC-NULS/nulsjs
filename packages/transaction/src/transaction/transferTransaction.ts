import {BaseTransaction, TransactionObject} from './baseTransaction'
import {TransactionType} from '@nuls.io/core'
import {MIN_FEE_PRICE_1024_BYTES} from './fee'
import {TransferTxData} from './txData/transferTxData'

export interface TransferTransactionObject extends TransactionObject {
  txData: null
}

export class TransferTransaction extends BaseTransaction {
  protected static className = TransferTransaction

  protected _type = TransactionType.Transfer
  protected _txData = new TransferTxData()
  protected _feePrice = MIN_FEE_PRICE_1024_BYTES

  public from(address: string, amount?: number, assetId?: number): this {
    return this.addInput(address, amount, assetId)
  }

  public to(
    address: string,
    amount?: number,
    lockTime?: number,
    assetId?: number,
  ): this {
    return this.addOutput(address, amount, lockTime, assetId)
  }
}

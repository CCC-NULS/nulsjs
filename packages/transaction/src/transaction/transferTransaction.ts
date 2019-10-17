import {BaseTransaction, TransactionObject} from './baseTransaction'
import {TransactionType} from '@nuls.io/core'
import {MIN_FEE_PRICE_1024_BYTES} from './fee'

export interface TransferTransactionObject extends TransactionObject {
  txData: null
}

export class TransferTransaction extends BaseTransaction {
  protected static className = TransferTransaction

  protected _type = TransactionType.Transfer
  protected _txData = null
  protected _feePrice = MIN_FEE_PRICE_1024_BYTES

  public async toObject(): Promise<TransactionObject> {
    const obj = await super.toObject()
    obj.txData = null
    return obj
  }
}

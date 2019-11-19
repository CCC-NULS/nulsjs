import {NulsParser, TransactionType} from '@nuls.io/core'
import {BaseTransaction} from './baseTransaction'
import {TransferTransaction} from './transferTransaction'
import {AccountAliasTransaction} from './accountAliasTransaction'
import {NodeDepositTransaction} from './nodeDepositTransaction'
import {NodeDepositCancelTransaction} from './nodeDepositCancelTransaction'

export class Transaction {
  public static fromBytes(bytes: Buffer | string): BaseTransaction {
    if (typeof bytes === 'string') {
      bytes = Buffer.from(bytes, 'base64')
    }

    const parser = new NulsParser(bytes)
    const type: TransactionType = parser.readUInt(2)

    switch (type) {
      case TransactionType.Transfer:
        return TransferTransaction.fromBytes(bytes)

      case TransactionType.AccountAlias:
        return AccountAliasTransaction.fromBytes(bytes)

      case TransactionType.NodeDeposit:
        return NodeDepositTransaction.fromBytes(bytes)

      case TransactionType.NodeDepositCancel:
        return NodeDepositCancelTransaction.fromBytes(bytes)

      default:
        throw new Error(
          `Transaction type ${
            TransactionType[type] ? TransactionType[type] : type
          } not supported`,
        )
    }
  }
}

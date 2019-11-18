import {BaseTransaction, TransactionObject} from './baseTransaction'
import {
  TransactionType,
  BlackHoleAddress,
  Address,
  isValidAddress,
  aliasTxAmount,
} from '@nuls.io/core'
import {MIN_FEE_PRICE_1024_BYTES} from './fee'
import {AliasTxData} from './txData/aliasTxData'

export interface AccountAliasTransactionObject extends TransactionObject {
  txData: AliasTxData
}

export class AccountAliasTransaction extends BaseTransaction {
  protected static className = AccountAliasTransaction
  protected static AliasAmount = aliasTxAmount

  protected _type = TransactionType.AccountAlias
  protected _txData: AliasTxData = new AliasTxData()
  protected _feePrice = MIN_FEE_PRICE_1024_BYTES

  public from(address: string, blackHoleAddress?: string): this {
    this.await(async () => {
      this._txData._address = address
      await this._updateInputsAndOutput(blackHoleAddress)
    })
    return this
  }

  public alias(alias: string): this {
    this.await(() => {
      this._txData._alias = alias
    })
    return this
  }

  protected _validate(): boolean {
    if (this._config.safeCheck) {
      if (!this._txData._alias) {
        throw new Error('Invalid alias')
      }
      if (!isValidAddress(this._txData._address)) {
        throw new Error('Invalid address')
      }
    }
    return super._validate()
  }

  protected async _updateInputsAndOutput(blackHoleAddress?: string) {
    if (!this._txData._address) {
      return
    }

    this._tmpInputs = []
    this._tmpOutputs = []

    if (!blackHoleAddress) {
      const addr: Address = Address.fromString(this._txData._address)
      blackHoleAddress = BlackHoleAddress[addr.chainId]

      if (!blackHoleAddress) {
        throw new Error('Black hole address is required')
      }
    }

    await this._addOutput(blackHoleAddress, AccountAliasTransaction.AliasAmount)

    await this._addInput(
      this._txData._address,
      AccountAliasTransaction.AliasAmount,
    )
  }
}

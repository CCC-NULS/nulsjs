import {BaseTransaction, TransactionObject} from './baseTransaction'
import {TransactionType, BlackHoleAddress, Address} from '@nuls.io/core'
import {MIN_FEE_PRICE_1024_BYTES} from './fee'
import {AliasTxData} from './txData/aliasTxData'

export interface AliasTransactionObject extends TransactionObject {
  txData: AliasTxData
}

export class AliasTransaction extends BaseTransaction {
  protected static className = AliasTransaction

  protected _type = TransactionType.AccountAlias
  protected _txData: AliasTxData = new AliasTxData()
  protected _feePrice = MIN_FEE_PRICE_1024_BYTES

  private static ALIAS_NA = 100000000

  public from(address: string, blackHoleAddress?: string): this {
    this.await(async () => {
      this._txData._address = address
      this._setBlackholeOutput(address, blackHoleAddress)
      this._tmpInputs = []
      await this._addInput(address, AliasTransaction.ALIAS_NA)
    })
    return this
  }

  public alias(alias: string): this {
    this.await(async () => {
      this._txData._alias = alias
    })

    return this
  }

  protected _validate(): boolean {
    if (this._config.safeCheck) {
      if (!this._txData._alias) {
        throw new Error('Account alias is required')
      }
      if (!this._txData._address) {
        throw new Error('Account address is required')
      }
    }
    return super._validate()
  }

  protected async _setBlackholeOutput(
    address: string,
    blackHoleAddress?: string,
  ) {
    this._tmpOutputs = []

    if (!blackHoleAddress) {
      const addr: Address = Address.fromString(address)
      blackHoleAddress = BlackHoleAddress[addr.chainId]

      if (!blackHoleAddress) {
        throw new Error('Black hole address is required')
      }
    }

    await this._addOutput(blackHoleAddress, AliasTransaction.ALIAS_NA)
  }
}

import {BaseTransaction, TransactionObject} from './baseTransaction'
import {
  TransactionType,
  BlackHoleAddress,
  Address,
  isValidAddress,
} from '@nuls.io/core'
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

  private static AliasNa = 100000000

  public from(address: string, blackHoleAddress?: string): this {
    this.await(async () => {
      this._txData._address = address
      await this._setBlackHoleOutput(blackHoleAddress)
      await this._updateInputs()
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

  protected async _updateInputs() {
    if (!this._txData._address) {
      return
    }
    this._tmpInputs = []
    await this._addInput(this._txData._address, AliasTransaction.AliasNa)
  }

  protected async _setBlackHoleOutput(blackHoleAddress?: string) {
    this._tmpOutputs = []

    if (!blackHoleAddress) {
      if (!this._txData._address) {
        return
      }

      const addr: Address = Address.fromString(this._txData._address)
      blackHoleAddress = BlackHoleAddress[addr.chainId]

      if (!blackHoleAddress) {
        throw new Error('Black hole address is required')
      }
    }

    await this._addOutput(blackHoleAddress, AliasTransaction.AliasNa)
  }
}

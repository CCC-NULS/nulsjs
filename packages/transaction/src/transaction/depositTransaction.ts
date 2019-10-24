import {BaseTransaction, TransactionObject} from './baseTransaction'
import {
  TransactionType,
  isValidAddress,
  isValidHash,
  nulsToNa,
} from '@nuls.io/core'
import {MIN_FEE_PRICE_1024_BYTES} from './fee'
import {DepositTxData} from './txData/depositTxData'

export interface DepositTransactionObject extends TransactionObject {
  txData: DepositTxData
}

export class DepositTransaction extends BaseTransaction {
  protected static className = DepositTransaction

  protected _type = TransactionType.AgentDeposit
  protected _txData: DepositTxData = new DepositTxData()
  protected _feePrice = MIN_FEE_PRICE_1024_BYTES

  private static ConsensusLocktime = -1

  public from(address: string): this {
    this.await(async () => {
      this._txData._address = address
      await this._updateOutputs()
      await this._updateInputs()
    })
    return this
  }

  public deposit(deposit: number): this {
    this.await(async () => {
      this._txData._deposit = deposit
      await this._updateOutputs()
      await this._updateInputs()
    })
    return this
  }

  public agent(hash: string): this {
    this.await(async () => {
      this._txData._agentHash = hash
    })
    return this
  }

  protected _validate(): boolean {
    if (this._config.safeCheck) {
      if (!isValidHash(this._txData._agentHash)) {
        throw new Error('Invalid agentHash')
      }

      if (!isValidAddress(this._txData._address)) {
        throw new Error('Invalid address')
      }

      if (!this._txData._deposit || this._txData._deposit < nulsToNa(2000)) {
        throw new Error(
          'Invalid deposit, should be equal or greater than 2000 nuls',
        )
      }
    }

    return super._validate()
  }

  protected async _updateInputs() {
    if (!this._txData._address || !this._txData._deposit) {
      return
    }

    this._tmpInputs = []
    await this._addInput(this._txData._address, this._txData._deposit)
  }

  protected async _updateOutputs() {
    if (!this._txData._address || !this._txData._deposit) {
      return
    }

    this._tmpOutputs = []

    await this._addOutput(
      this._txData._address,
      this._txData._deposit,
      DepositTransaction.ConsensusLocktime,
    )
  }
}
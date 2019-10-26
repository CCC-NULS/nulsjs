import {BaseTransaction, TransactionObject} from './baseTransaction'
import {TransactionType, isValidHash, consensusLocktime} from '@nuls.io/core'
import {MIN_FEE_PRICE_1024_BYTES} from './fee'
import {DepositCancelTxData} from './txData/depositCancelTxData'

export interface DepositCancelTransactionObject extends TransactionObject {
  txData: DepositCancelTxData
}

export class DepositCancelTransaction extends BaseTransaction {
  protected static className = DepositCancelTransaction
  protected static ConsensusLocktime = consensusLocktime

  protected _type = TransactionType.AgentDepositCancel
  protected _txData: DepositCancelTxData = new DepositCancelTxData()
  protected _feePrice = MIN_FEE_PRICE_1024_BYTES

  public depositHash(hash: string): this {
    this.await(async () => {
      this._txData._depositHash = hash
      await this._updateInputsAndOutputs()
    })
    return this
  }

  protected _validate(): boolean {
    if (this._config.safeCheck) {
      if (!isValidHash(this._txData._depositHash)) {
        throw new Error('Invalid depositHash')
      }
    }

    return super._validate()
  }

  protected async _updateInputsAndOutputs() {
    if (!this._txData._depositHash) {
      return
    }

    this._clearInputsAndOutputs()

    const {ok, data} = await this._txApi.getTransaction(
      this._config.chainId,
      this._txData._depositHash,
    )

    if (!ok) {
      throw new Error('Error fetching deposit transaction')
    }

    const lockedOutput = data.coinTos.find(
      output => output.lockTime === DepositCancelTransaction.ConsensusLocktime,
    )

    if (!lockedOutput) {
      throw new Error('Wrong deposit transaction hash')
    }

    const address = lockedOutput.address
    const amount = lockedOutput.amount

    await this._addOutput(address, amount, 0)
    await this._addInput(address, amount, -1)

    const fee = await this._getFee()

    this._clearOutputs()
    await this._addOutput(address, amount - fee, 0)
  }
}

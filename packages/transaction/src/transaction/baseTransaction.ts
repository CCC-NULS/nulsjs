import {
  BlockVersion,
  TransactionType,
  NulsSerializer,
  NulsParser,
  sha256,
  deriveECPublicKey,
  signEC,
  ApiServiceConfig,
  Address,
} from '@nuls.io/core'
import {CoinData, CoinDataObject} from '../coin/coinData'
import PromiEvent from 'promievent'
import {TransactionApi} from '../api'
import {MIN_FEE_PRICE_1024_BYTES, getTxFee} from './fee'
import {CoinInput, CoinOutput} from '../coin/coin'
import cfg from '../../config.yaml'
import {TxDataObject, BaseTxData} from './txData/baseTxData'

// eslint-disable-next-line @typescript-eslint/no-use-before-define
export type TransactionStaticClass = typeof BaseTransaction

export interface TransactionConstructor<T extends BaseTransaction> {
  new (
    config?: TransactionConfig,
    blockHeight?: number,
    blockVersion?: BlockVersion,
  ): T
}

export type TransactionClass<
  T extends BaseTransaction
> = TransactionConstructor<T> & TransactionStaticClass

export type TransactionHash = string
export type TransactionReceipt = string
export type TransactionHex = string

export interface TransactionConfig {
  api?: ApiServiceConfig
  safeCheck?: boolean
  blocksMinedTimeout?: number
}

export interface DefaultTransactionConfig extends TransactionConfig {
  safeCheck: boolean
  blocksMinedTimeout: number
}

export interface TransactionObject {
  hash: string
  type: TransactionType
  blockHeight: number
  time: number
  remark: string
  txData: any
  coinData: CoinDataObject
  signature: string
}

export abstract class BaseTransaction {
  private _p: Promise<any> = Promise.resolve()

  protected _hash: Buffer = Buffer.from([])
  protected _type!: TransactionType
  protected _time: number = Math.floor(Date.now() / 1000)
  protected _remark: string = ''
  protected _txData!: BaseTxData
  protected _coinData: CoinData = new CoinData()
  protected _signature: Buffer = Buffer.from([])
  protected _blockHeight: number = -1
  protected _blockVersion: number = BlockVersion.NotDefined

  protected _tmpInputs: CoinInput[] = []
  protected _tmpOutputs: CoinOutput[] = []

  protected _feePrice = MIN_FEE_PRICE_1024_BYTES
  protected _systemTx: boolean = false
  protected _extraFee: number = 0
  protected _config: DefaultTransactionConfig = {
    safeCheck: true,
    blocksMinedTimeout: cfg.blocksMinedTimeout,
  }
  protected _txApi: TransactionApi

  public static fromBytes<T extends BaseTransaction>(
    this: TransactionClass<T>,
    bytes: Buffer,
  ): T {
    const parser = new NulsParser(bytes)
    const tx = new this()

    tx._type = parser.readUInt(2)
    tx._time = parser.readUInt(4)
    tx._remark = parser.readString()

    const txDataBytes = parser.readBytesWithLength()
    tx._txData.fromBytes(txDataBytes)

    const coinDataBytes = parser.readBytesWithLength()
    tx._coinData = CoinData.fromBytes(coinDataBytes)

    tx._signature = parser.readBytesWithLength()
    return tx
  }

  public constructor(
    config?: TransactionConfig,
    blockHeight: number = -1,
    blockVersion: BlockVersion = BlockVersion.SmartContracts,
    txApi?: TransactionApi,
  ) {
    this._blockHeight = blockHeight
    this._blockVersion = blockVersion
    this._config = {
      ...this._config,
      ...config,
    }
    this._txApi = txApi || new TransactionApi(this._config.api)
  }

  public async toBytes(): Promise<Buffer> {
    return this.await(() => this._toBytes())
  }

  public async toObject(): Promise<TransactionObject> {
    return this.await(async () => {
      const txData: TxDataObject = this._txData.toObject()
      const coinData: CoinDataObject = this._coinData.toObject()
      const hash = this._getHash()

      return {
        hash: hash.toString('hex'),
        type: this._type,
        blockHeight: this._blockHeight,
        time: this._time,
        remark: this._remark,
        txData,
        coinData,
        signature: this._signature.toString('hex'),
      }
    })
  }

  public getType(): TransactionType {
    return this._type
  }

  public time(time: number): this {
    this.await(() => {
      this._time = time
    })
    return this
  }

  public remark(remark: string): this {
    this.await(() => {
      this._remark = remark
    })
    return this
  }

  public fee(amount: number): this {
    this.await(async () => {
      this._extraFee = amount
      await this._recalculateInputsAndOutputs()
    })
    return this
  }

  // TODO: Implement all kinds of signature (P2PKH, P2PSH, etc...)
  public sign(privateKey: string): this {
    this.await(async () => {
      this._validate()

      const skBuf = Buffer.from(privateKey, 'hex')
      const pkBuf = deriveECPublicKey(skBuf)

      const hash = this._getHash()
      const sigBuf = signEC(hash, skBuf)

      this._signature = new NulsSerializer()
        .writeBytesWithLength(pkBuf)
        .writeBytesWithLength(sigBuf)
        .toBuffer()
    })

    return this
  }

  public clearSignature(): this {
    this.await(async () => {
      this._signature = Buffer.from([])
    })
    return this
  }

  public coinData(coinData: CoinData): this {
    this.await(() => {
      this._coinData = coinData
    })
    return this
  }

  public async getFee(): Promise<number> {
    return this.await(() => this._getFee())
  }

  public async serialize(): Promise<TransactionHex> {
    return this.await(() => this._serialize())
  }

  public async calculateFee(): Promise<number> {
    return this.await(() => this._calculateFee())
  }

  public async validate(): Promise<TransactionReceipt> {
    if (this._signature.length === 0) {
      throw new Error('The transaction is not signed')
    }
    const txHex: TransactionHex = this._serialize()

    const {value} = await this._txApi.validateTransaction(txHex)
    return value
  }

  public send(): PromiEvent<TransactionReceipt> {
    const pe = new PromiEvent<string>((resolve, reject) => {
      this.await(async () => {
        if (this._signature.length === 0) {
          throw new Error('The transaction is not signed')
        }

        // const blockApi = new BlockApi(this._config.api)
        const txHex: TransactionHex = this._serialize()

        // let firstHeight = -1
        // const subscription = blockApi.subscribe()

        const {hash} = await this._txApi.broadcast(txHex)
        pe.emit('txHash', hash)
        resolve(hash)

        // subscription
        //   .on('block', (block: ApiBlock) => {
        //     if (firstHeight === -1) {
        //       firstHeight = block.height
        //     }

        //     block.transactions.forEach(tx => {
        //       if (tx.hash === txHash) {
        //         subscription.close()
        //         pe.emit('txReceipt', tx)
        //         pe.resolve(tx)
        //         return
        //       }
        //     })

        //     if (block.height - firstHeight >= this._config.blocksMinedTimeout) {
        //       subscription.close()
        //       const e = new Error(
        //         `The transaction was not included in the next ${this._config.blocksMinedTimeout} blocks`,
        //       )
        //       pe.emit('error', e)
        //       pe.reject(e)
        //       return
        //     }
        //   })
        //   .on('error', e => {
        //     e = new Error(
        //       `There was an error verifing the transaction status: ${e}`,
        //     )
        //     subscription.close()
        //     pe.emit('error', e)
        //     pe.reject(e)
        //   })
      }).catch(e => {
        const err = new Error(
          `There was an error sending the transaction to the network: ${e}`,
        )
        reject(err)
      })
    })

    return pe
  }

  protected addInput(address: string, amount?: number, assetId?: number): this {
    this.await(() => this._addInput(address, amount, assetId))
    return this
  }

  protected addOutput(
    address: string,
    amount?: number,
    lockTime?: number,
    assetId?: number,
  ): this {
    this.await(() => this._addOutput(address, amount, lockTime, assetId))
    return this
  }

  protected _getHash(): Buffer {
    if (this._hash.length > 0) {
      return this._hash
    }

    let bytes = this._toBytesForHash()

    this._hash = sha256(sha256(bytes))
    return this._hash
  }

  protected _validate(): boolean {
    if (this._config.safeCheck) {
      if (!this._txData) {
        throw new Error('Transaction data is not filled')
      }

      if (this._remark && this._remark.length > 600) {
        throw new Error('Remark can not be greater than 600 bytes')
      }

      if (this._coinData.getInputs().length === 0) {
        throw new Error('There must be at least one input, something is missed')
      }

      if (this._coinData.getOutputs().length === 0) {
        throw new Error(
          'There must be at least one output, something is missed',
        )
      }

      const fee = this._coinData.getFee()

      if (fee < 0) {
        throw new Error('Not enough balance to make the transaction')
      }

      const neededFee = this._calculateFee()

      if (fee < neededFee) {
        throw new Error('Not enough fee to make the transaction')
      }
    }

    return true
  }

  protected _serialize(): TransactionHex {
    this._validate()
    const bytes = this._toBytes()
    return bytes.toString('hex')
  }

  protected _toBytes(): Buffer {
    return new NulsSerializer()
      .writeUInt(this._type, 2)
      .writeUInt(this._time, 4)
      .writeString(this._remark)
      .writeBytesWithLength(this._txData.toBytes())
      .writeBytesWithLength(this._coinData.toBytes())
      .writeBytesWithLength(this._signature)
      .toBuffer()
  }

  protected _toBytesForHash(): Buffer {
    return new NulsSerializer()
      .writeUInt(this._type, 2)
      .writeUInt(this._time, 4)
      .writeString(this._remark)
      .writeBytesWithLength(this._txData.toBytes())
      .writeBytesWithLength(this._coinData.toBytes())
      .toBuffer()
  }

  protected _getFee(): number {
    return !this._systemTx ? this._coinData.getFee() : 0
  }

  protected _size(): number {
    const bytes = this._toBytes()
    return bytes.length
  }

  protected _calculateFee(): number {
    const size = this._size()
    const fee = getTxFee(size, this._feePrice)
    return Math.max(fee, this._extraFee)
  }

  protected async _addInput(
    address: string,
    amount: number = -1,
    locked: number = 0,
    nonce: string = '',
    assetId: number = 1,
  ): Promise<CoinInput> {
    // If input already exists, just remove previous and add the new one
    const inputIdx = this._tmpInputs.findIndex(
      input => input._address === address && input._assetId === assetId,
    )
    if (inputIdx >= 0) {
      this._tmpInputs.splice(inputIdx, 1)
    }

    const addr: Address = Address.fromString(address)

    const tmpInput = new CoinInput(
      address,
      amount,
      nonce,
      locked,
      addr.chainId,
      assetId,
    )
    await tmpInput.getBalance(this._config.api)
    this._tmpInputs.push(tmpInput)

    await this._recalculateInputsAndOutputs()
    return tmpInput
  }

  protected async _addOutput(
    address: string,
    amount: number = -1,
    lockTime: number = 0,
    assetId: number = 1,
  ): Promise<CoinOutput> {
    // If input already exists, just remove previous and add the new one
    const outputIdx = this._tmpOutputs.findIndex(
      output =>
        output._address === address &&
        output._assetId === assetId &&
        output._lockTime === lockTime,
    )
    if (outputIdx >= 0) {
      this._tmpOutputs.splice(outputIdx, 1)
    }

    const addr: Address = Address.fromString(address)
    const tmpOutput = new CoinOutput(
      address,
      amount,
      lockTime,
      addr.chainId,
      assetId,
    )
    this._tmpOutputs.push(tmpOutput)

    await this._recalculateInputsAndOutputs()
    return tmpOutput
  }

  protected _clearInputs(): void {
    this._tmpInputs = []
  }

  protected _clearOutputs(): void {
    this._tmpOutputs = []
  }

  protected _clearInputsAndOutputs(): void {
    this._tmpInputs = []
    this._tmpOutputs = []
  }

  protected async _recalculateInputsAndOutputs(): Promise<void> {
    await this._recalculateOutputs()
    await this._recalculateInputs()
  }

  protected async _recalculateOutputs(): Promise<void> {
    this._coinData.resetOutputs()

    const outputFullAmount = this._tmpOutputs.find(output => output._amount < 0)
    const outputs = this._tmpOutputs.filter(output => output._amount > 0)

    this._coinData.outputs(outputs)

    // Todo: Think about copy data instead of sharing memory for outputs
    // for (let output of outputs) {
    //   const newOutput = CoinOutput.clone(output)
    //   this._coinData.addOutput(newOutput)
    // }

    if (outputFullAmount) {
      const newOutput = CoinOutput.clone(outputFullAmount)
      newOutput._amount = Number.MAX_SAFE_INTEGER
      this._coinData.addOutput(newOutput)

      await this._recalculateInputs()

      const outputAmount = outputs.reduce(
        (value, output) => value + output._amount,
        0,
      )

      const inputValue = this._coinData.getInputsValue() - outputAmount
      if (inputValue > 0) {
        const fee = this._calculateFee()
        newOutput._amount = inputValue - fee

        if (newOutput._amount <= 0) {
          throw new Error('Not enough balance to make the transaction')
        }

        // await this._recalculateInputs()
      }
    }
  }

  protected async _recalculateInputs(): Promise<void> {
    let outputValue = this._coinData.getOutputsValue()

    if (outputValue > 0) {
      this._coinData.resetInputs()
      const inputs = this._tmpInputs

      for (let input of inputs) {
        const balanceData = await input.getBalance(this._config.api)
        const balance =
          input._locked === -1 ? balanceData.freeze : balanceData.balance
        const inputAmount = input._amount < 0 ? balance : input._amount

        if (this._config.safeCheck && (balance < inputAmount || balance <= 0)) {
          throw new Error('Insufficient input balance')
        }

        let newAmount = Math.min(outputValue, inputAmount)
        outputValue -= newAmount

        const newInput = CoinInput.clone(input)
        newInput._amount = newAmount

        this._coinData.addInput(newInput)

        if (outputValue <= 0) {
          break
        }
      }

      // If we have had enough input amount to pay outputs
      if (outputValue <= 0) {
        await this._recalculateFee()
      }
    }
  }

  protected async _recalculateFee(): Promise<void> {
    const actualFee = this._getFee()
    const feeToPay = this._calculateFee()

    if (feeToPay > actualFee) {
      let acumFee = actualFee
      const inputs = this._coinData.getInputs()

      const enough = await this.inputsFeeAddition(inputs, feeToPay, acumFee)

      // If we have more inputs, we can add them for paying fees
      if (!enough) {
        const restTmpInputs = this._tmpInputs.slice(inputs.length)

        await this.inputsFeeAddition(restTmpInputs, feeToPay, acumFee)
      }
    }
  }

  protected async inputsFeeAddition(
    inputs: CoinInput[],
    feeToPay: number,
    acumFee: number,
  ) {
    for (let input of inputs) {
      const balanceData = await input.getBalance(this._config.api)
      const balance =
        input._locked === -1 ? balanceData.freeze : balanceData.balance

      const availableBalance = balance - input._amount
      const neededBalance = feeToPay - acumFee

      const sum = Math.min(availableBalance, neededBalance)

      acumFee += sum
      input._amount += sum

      if (acumFee >= feeToPay) {
        return true
      }
    }
    return false
  }

  protected await<T, R extends T | Promise<T>>(fn: () => R): Promise<T> {
    this._p = this._p.then(fn)
    return this._p as Promise<T>
  }
}

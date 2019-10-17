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
  verifyEC,
} from '@nuls.io/core'
import {CoinData, CoinDataObject} from '../coin/coinData'
import PromiEvent from 'promievent'
import {TransactionApi} from '../api'
import {MIN_FEE_PRICE_1024_BYTES, getTxFee} from './fee'
import {Account} from '@nuls.io/account'
import {CoinInput, CoinOutput} from '../coin/coin'
import cfg from '../../config.yaml'

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
  protected _txData!: any
  protected _coinData: CoinData = new CoinData()
  protected _signature: Buffer = Buffer.from([])
  protected _blockHeight: number = -1
  protected _blockVersion: number = BlockVersion.NotDefined

  protected _feePrice = MIN_FEE_PRICE_1024_BYTES
  protected _systemTx: boolean = false
  protected _extraFee: number = 0
  protected _config: DefaultTransactionConfig = {
    safeCheck: true,
    blocksMinedTimeout: cfg.blocksMinedTimeout,
  }

  public static fromBytes<T extends BaseTransaction>(
    this: TransactionClass<T>,
    bytes: Buffer,
  ): T {
    const parser = new NulsParser(bytes)
    const tx = new this()

    tx._type = parser.read(2)
    tx._time = parser.read(4)
    tx._remark = parser.readString()
    tx._txData = parser.readBytesWithLength()

    const coinDataBytes = parser.readBytesWithLength()
    tx._coinData = CoinData.fromBytes(coinDataBytes)

    tx._signature = parser.readBytesWithLength()
    return tx
  }

  public constructor(
    config?: TransactionConfig,
    blockHeight: number = -1,
    blockVersion: BlockVersion = BlockVersion.SmartContracts,
  ) {
    this._blockHeight = blockHeight
    this._blockVersion = blockVersion
    this.config(config)
  }

  private await<T, R extends T | Promise<T>>(fn: () => R): Promise<T> {
    this._p = this._p.then(fn)
    return this._p as Promise<T>
  }

  public async toBytes(): Promise<Buffer> {
    return this.await(() => this._toBytes())
  }

  public async toObject(): Promise<TransactionObject> {
    return this.await(async () => {
      const coinData: CoinDataObject = this._coinData.toObject()
      const hash = this._getHash()

      return {
        hash: hash.toString('hex'),
        type: this._type,
        blockHeight: this._blockHeight,
        time: this._time,
        remark: this._remark,
        txData: this._txData, // TODO: Implement in each transaction kind
        coinData,
        signature: this._signature.toString('hex'),
      }
    })
  }

  public getType(): TransactionType {
    return this._type
  }

  public async config(config?: TransactionConfig): Promise<this> {
    return this.await(() => {
      if (config) {
        this._config = {
          ...this._config,
          ...config,
        }
      }
      return this
    })
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
      await this._recalculateInputs()
    })
    return this
  }

  public from(address: string, amount: number, assetId: number = 1): this {
    this.await(async () => {
      const addr: Address = Address.fromString(address)

      const balance = await Account.getBalance(
        address,
        addr.chainId,
        assetId,
        this._config.api,
      )

      console.log(balance)

      if (this._config.safeCheck && balance.balance < amount + this._feePrice) {
        throw new Error('Insufficient input balance')
      }

      const input = new CoinInput(
        address,
        amount + this._feePrice,
        balance.nonce,
        balance.timeLock || 0,
        addr.chainId,
        assetId,
        balance.balance,
      )
      this._coinData.addInput(input)

      await this._recalculateInputs()
    })

    return this
  }

  public to(
    address: string,
    amount: number,
    lockTime: number = 0,
    assetId: number = 1,
  ): this {
    this.await(async () => {
      const addr: Address = Address.fromString(address)
      const output = new CoinOutput(
        address,
        amount,
        lockTime,
        addr.chainId,
        assetId,
      )
      this._coinData.addOutput(output)

      await this._recalculateInputs()
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

  public async serialize(): Promise<TransactionHex> {
    return this.await(() => this._serialize())
  }

  public send(config?: TransactionConfig): PromiEvent<TransactionReceipt> {
    const pe = new PromiEvent<string>((resolve, reject) => {
      this.await(async () => {
        if (this._signature.length === 0) {
          throw new Error('The transaction is not signed')
        }

        this.config(config)

        const txApi = new TransactionApi(this._config.api)
        // const blockApi = new BlockApi(this._config.api)
        const chainId = this._coinData.getInputs()[0]._chainId
        const txHex: TransactionHex = this._serialize()

        // let firstHeight = -1
        // const subscription = blockApi.subscribe()

        // const {value} = await txApi.validateTransaction(chainId, txHex)

        const {hash} = await txApi.broadcast(chainId, txHex)

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

  public _serialize(): TransactionHex {
    this._validate()
    const bytes = this._toBytes()
    return bytes.toString('hex')
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
      if (this._txData === undefined) {
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

  protected _toBytes(): Buffer {
    return new NulsSerializer()
      .writeUInt16LE(this._type)
      .writeUInt32LE(this._time)
      .writeString(this._remark)
      .writeBytesWithLength(this._txData)
      .writeBytesWithLength(this._coinData.toBytes())
      .writeBytesWithLength(this._signature)
      .toBuffer()
  }

  protected _toBytesForHash(): Buffer {
    return new NulsSerializer()
      .writeUInt16LE(this._type)
      .writeUInt32LE(this._time)
      .writeString(this._remark)
      .writeBytesWithLength(this._txData)
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

  protected _calculateFee(
    signature: number = this._signature.length > 0 ? 1 : 0,
  ): number {
    const size = this._size()
    const fee = getTxFee(size, signature, this._feePrice)
    return Math.max(fee, this._feePrice) + this._extraFee
  }

  protected async _recalculateInputs(): Promise<void> {
    let actualFee = this._getFee()
    const newFee = this._calculateFee()

    if (newFee > actualFee) {
      const inputs = this._coinData.getInputs()

      for (let input of inputs) {
        const balance = await input.getBalance()
        const availableBalance = balance - input._amount
        const neededBalance = newFee - actualFee

        let sum = Math.min(availableBalance, neededBalance)
        actualFee += sum
        input._amount += sum

        if (actualFee >= newFee) {
          break
        }
      }

      if (actualFee < newFee) {
        throw new Error('Not enough balance for paying fees')
      }
    }
  }
}
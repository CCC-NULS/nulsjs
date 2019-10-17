import {
  NulsSerializer,
  ChainId,
  Address,
  ApiServiceConfig,
  NulsParser,
} from '@nuls.io/core'
import {Account, AccountBalance} from '@nuls.io/account'

export type CoinObject = CoinInputObject | CoinOutputObject

export interface CoinBaseObject {
  address: string
  assetsChainId: ChainId
  assetsId: number
  amount: number
}

export interface CoinInputObject extends CoinBaseObject {
  nonce: string
  locked: number
}

export interface CoinOutputObject extends CoinBaseObject {
  lockTime: number
}

export class Coin {
  public constructor(
    public _address: string,
    public _chainId: ChainId,
    public _assetsId: number,
    public _amount: number,
  ) {}

  public static fromBytes(bytes: Buffer | NulsParser): Coin {
    const parser = bytes instanceof NulsParser ? bytes : new NulsParser(bytes)

    const addressBytes = parser.readBytesWithLength()
    const address = Address.fromBytes(addressBytes).address

    const chainId = parser.read(2)
    const assetsId = parser.read(2)
    const amount = parser.readBigInt().toNumber()

    return new Coin(address, chainId, assetsId, amount)
  }

  public toBytes(): Buffer {
    const addressBytes = Address.fromString(this._address).toBytes()

    return new NulsSerializer()
      .writeBytesWithLength(addressBytes)
      .writeUInt16LE(this._chainId)
      .writeUInt16LE(this._assetsId)
      .writeBigInt(this._amount)
      .toBuffer()
  }

  public toObject(): CoinBaseObject {
    return {
      address: this._address,
      assetsChainId: this._chainId,
      assetsId: this._assetsId,
      amount: this._amount,
    }
  }

  public serialize(): string {
    return this.toBytes().toString('hex')
  }

  public size(): number {
    return this.toBytes().length
  }
}

export class CoinInput extends Coin {
  public constructor(
    public _address: string,
    public _amount: number,
    public _nonce: string,
    public _locked: number,
    public _chainId: ChainId,
    public _assetsId: number,
    public _balance?: number,
  ) {
    super(_address, _chainId, _assetsId, _amount)
  }

  public static fromBytes(bytes: Buffer | NulsParser): CoinInput {
    const parser = bytes instanceof NulsParser ? bytes : new NulsParser(bytes)

    const coin = Coin.fromBytes(parser)
    const nonceBytes = parser.readBytesWithLength()
    const nonce = nonceBytes.toString('hex')
    const locked = parser.read(1)

    return new CoinInput(
      coin._address,
      coin._amount,
      nonce,
      locked,
      coin._chainId,
      coin._assetsId,
    )
  }

  public toBytes(): Buffer {
    const coinBytes = super.toBytes()
    const nonceBytes = Buffer.from(this._nonce, 'hex')

    return new NulsSerializer()
      .write(coinBytes)
      .writeBytesWithLength(nonceBytes)
      .writeUInt8(this._locked)
      .toBuffer()
  }

  public toObject(): CoinInputObject {
    const coinObject = super.toObject()

    return {
      ...coinObject,
      nonce: this._nonce,
      locked: this._locked,
    }
  }

  public async getBalance(config?: ApiServiceConfig): Promise<number> {
    if (this._balance !== undefined) {
      return this._balance
    }

    const balance = await Account.getBalance(
      this._address,
      this._chainId,
      this._assetsId,
      config,
    )

    this._balance = balance.balance
    this._nonce = balance.nonce
    this._locked = balance.timeLock || 0

    return this._balance
  }
}

export class CoinOutput extends Coin {
  public constructor(
    public _address: string,
    public _amount: number,
    public _lockTime: number,
    public _chainId: ChainId,
    public _assetsId: number,
  ) {
    super(_address, _chainId, _assetsId, _amount)
  }

  public static fromBytes(bytes: Buffer | NulsParser): CoinOutput {
    const parser = bytes instanceof NulsParser ? bytes : new NulsParser(bytes)

    const coin = Coin.fromBytes(parser)
    const lockTime = parser.readUInt64LE().toNumber()

    return new CoinOutput(
      coin._address,
      coin._amount,
      lockTime,
      coin._chainId,
      coin._assetsId,
    )
  }

  public toBytes(): Buffer {
    const coinBytes = super.toBytes()

    const serial = new NulsSerializer().write(coinBytes)

    if (this._lockTime === -1) {
      serial.write(Buffer.from('ffffffffffffffffff', 'hex'))
    } else {
      serial.writeUInt64LE(this._lockTime)
    }

    return serial.toBuffer()
  }

  public toObject(): CoinOutputObject {
    const coinObject = super.toObject()

    return {
      ...coinObject,
      lockTime: this._lockTime,
    }
  }
}

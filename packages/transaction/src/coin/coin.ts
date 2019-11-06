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
    public _assetId: number,
    public _amount: number,
  ) {}

  public static fromBytes(bytes: Buffer | NulsParser): Coin {
    const parser = bytes instanceof NulsParser ? bytes : new NulsParser(bytes)

    const addressBytes = parser.readBytesWithLength()
    const address = Address.fromBytes(addressBytes).address

    const chainId = parser.readUInt(2)
    const assetsId = parser.readUInt(2)
    const amount = parser.readBigInt().toNumber()

    return new Coin(address, chainId, assetsId, amount)
  }

  public toBytes(): Buffer {
    const addressBytes = Address.fromString(this._address).toBytes()

    return new NulsSerializer()
      .writeBytesWithLength(addressBytes)
      .writeUInt16LE(this._chainId)
      .writeUInt16LE(this._assetId)
      .writeBigInt(this._amount)
      .toBuffer()
  }

  public toObject(): CoinBaseObject {
    return {
      address: this._address,
      assetsChainId: this._chainId,
      assetsId: this._assetId,
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
    public _assetId: number,
    public _balance?: AccountBalance,
  ) {
    super(_address, _chainId, _assetId, _amount)
  }

  public static clone(i: CoinInput): CoinInput {
    return new CoinInput(
      i._address,
      i._amount,
      i._nonce,
      i._locked,
      i._chainId,
      i._assetId,
      i._balance,
    )
  }

  public static fromBytes(bytes: Buffer | NulsParser): CoinInput {
    const parser = bytes instanceof NulsParser ? bytes : new NulsParser(bytes)

    const coin = Coin.fromBytes(parser)
    const nonceBytes = parser.readBytesWithLength()
    const nonce = nonceBytes.toString('hex')
    const locked = parser.readInt(1)

    return new CoinInput(
      coin._address,
      coin._amount,
      nonce,
      locked,
      coin._chainId,
      coin._assetId,
    )
  }

  public toBytes(): Buffer {
    const coinBytes = super.toBytes()
    const nonceBytes = Buffer.from(this._nonce, 'hex')

    return new NulsSerializer()
      .write(coinBytes)
      .writeBytesWithLength(nonceBytes)
      .writeInt8(this._locked)
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

  public async getBalance(config?: ApiServiceConfig): Promise<AccountBalance> {
    if (this._balance !== undefined) {
      return this._balance
    }

    const balance: AccountBalance = await Account.getBalance(
      this._address,
      this._assetId,
      config,
    )

    this._balance = balance
    this._nonce = this._nonce || balance.nonce

    return this._balance
  }
}

export class CoinOutput extends Coin {
  public constructor(
    public _address: string,
    public _amount: number,
    public _lockTime: number,
    public _chainId: ChainId,
    public _assetId: number,
  ) {
    super(_address, _chainId, _assetId, _amount)
  }

  public static clone(o: CoinOutput): CoinOutput {
    return new CoinOutput(
      o._address,
      o._amount,
      o._lockTime,
      o._chainId,
      o._assetId,
    )
  }

  public static fromBytes(bytes: Buffer | NulsParser): CoinOutput {
    const parser = bytes instanceof NulsParser ? bytes : new NulsParser(bytes)

    const coin = Coin.fromBytes(parser)
    const lockTime = parser.readInt64LE().toNumber()

    return new CoinOutput(
      coin._address,
      coin._amount,
      lockTime,
      coin._chainId,
      coin._assetId,
    )
  }

  public toBytes(): Buffer {
    const coinBytes = super.toBytes()

    const serial = new NulsSerializer().write(coinBytes)

    return serial.writeInt64LE(this._lockTime).toBuffer()
  }

  public toObject(): CoinOutputObject {
    const coinObject = super.toObject()

    return {
      ...coinObject,
      lockTime: this._lockTime,
    }
  }
}

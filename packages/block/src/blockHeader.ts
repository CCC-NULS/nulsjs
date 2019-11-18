import {
  deriveECPublicKey,
  sha256,
  NulsSerializer,
  signEC,
  NulsParser,
  Address,
  ChainId,
  AddressType,
} from '@nuls.io/core'
import {BlockHeaderExtend} from './blockHeaderExtend'
import {BlockSignature} from './blockSignature'

export interface BlockHeaderObject {
  hash: string
  preHash: string
  merkleHash: string
  time: number
  height: number
  txCount: number
  packingAddress: string
  signature: string
}

export class BlockHeader {
  protected _hash: string = ''
  protected _preHash: string = ''
  protected _merkleHash: string = ''
  protected _time: number = new Date().getTime()
  protected _height: number = -1
  protected _txCount: number = 0
  protected _extend: BlockHeaderExtend = new BlockHeaderExtend()
  protected _signature: Buffer = Buffer.from([])

  protected _packingAddress: string = ''

  public static fromBytes(
    bytes: Buffer | NulsParser,
    chainId: ChainId = ChainId.Mainnet,
  ): BlockHeader {
    const parser = bytes instanceof NulsParser ? bytes : new NulsParser(bytes)
    const header = new BlockHeader()

    header._preHash = parser.readHash()
    header._merkleHash = parser.readHash()
    header._time = parser.readUInt(4)
    header._height = parser.readUInt(4)
    header._txCount = parser.readUInt(4)

    const extendBytes = parser.readBytesWithLength()
    header._extend = BlockHeaderExtend.fromBytes(extendBytes)

    header._signature = parser.read()

    const signature = BlockSignature.fromBytes(header._signature).toObject()
    header._packingAddress = Address.from(
      chainId,
      AddressType.Default,
      Buffer.from(signature.publicKey, 'hex'),
    ).address

    return header
  }

  public toBytes(): Buffer {
    return new NulsSerializer()
      .writeHash(this._preHash)
      .writeHash(this._merkleHash)
      .writeUInt(this._time, 4)
      .writeUInt(this._height, 4)
      .writeUInt(this._txCount, 4)
      .writeBytesWithLength(this._extend.toBytes())
      .write(this._signature)
      .toBuffer()
  }

  public toObject(): BlockHeaderObject {
    const obj = this._extend.toObject()

    return {
      hash: this.getHash(),
      preHash: this._preHash,
      merkleHash: this._merkleHash,
      time: this._time,
      height: this._height,
      txCount: this._txCount,
      ...obj,
      packingAddress: this._packingAddress,
      signature: this._signature.toString('hex'),
    }
  }

  public size(): number {
    const bytes = this.toBytes()
    return bytes.length
  }

  public getHash(): string {
    if (this._hash.length > 0) {
      return this._hash
    }

    let bytes = this.toBytesForHash()

    this._hash = sha256(sha256(bytes)).toString('hex')
    return this._hash
  }

  public getTxCount(): number {
    return this._txCount
  }

  public getHeight(): number {
    return this._height
  }

  public sign(privateKey: string): this {
    const skBuf = Buffer.from(privateKey, 'hex')
    const pkBuf = deriveECPublicKey(skBuf)

    const hash = Buffer.from(this.getHash(), 'hex')
    const sigBuf = signEC(hash, skBuf)

    this._signature = new NulsSerializer()
      .writeBytesWithLength(pkBuf)
      .writeBytesWithLength(sigBuf)
      .toBuffer()

    return this
  }

  protected toBytesForHash(): Buffer {
    return new NulsSerializer()
      .writeHash(this._preHash)
      .writeHash(this._merkleHash)
      .writeUInt(this._time, 4)
      .writeUInt(this._height, 4)
      .writeUInt(this._txCount, 4)
      .writeBytesWithLength(this._extend.toBytes())
      .toBuffer()
  }
}

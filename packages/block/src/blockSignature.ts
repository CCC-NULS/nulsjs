import {NulsSerializer, NulsParser} from '@nuls.io/core'

export interface BlockSignatureObject {
  publicKey: string
  signedData: string
}

export class BlockSignature {
  protected _publicKey: Buffer = Buffer.from([])
  protected _signedData: Buffer = Buffer.from([])

  public static fromBytes(bytes: Buffer | NulsParser): BlockSignature {
    const parser = bytes instanceof NulsParser ? bytes : new NulsParser(bytes)
    const signature = new BlockSignature()

    const pkLength = parser.readUInt(1)
    signature._publicKey = parser.read(pkLength)
    signature._signedData = parser.readBytesWithLength()

    return signature
  }

  public toBytes(): Buffer {
    return new NulsSerializer()
      .writeUInt(this._publicKey.length)
      .write(this._publicKey)
      .writeBytesWithLength(this._signedData)
      .toBuffer()
  }

  public toObject(): BlockSignatureObject {
    return {
      publicKey: this._publicKey.toString('hex'),
      signedData: this._signedData.toString('hex'),
    }
  }

  public size(): number {
    const bytes = this.toBytes()
    return bytes.length
  }
}

import BN from 'bn.js'
import {Address} from './address'
import {addressLength} from './common'

export class NulsSerializer {
  protected static addressLength = addressLength
  protected static placeholder = Buffer.from([0x00])

  protected size: number = 0
  protected bufs: Buffer[] = []

  public writeBytesWithLength(bytes: Buffer) {
    if (!bytes || bytes.length === 0) {
      return this.write(NulsSerializer.placeholder)
    }
    this.writeVarintNum(bytes.length)
    return this.write(bytes)
  }

  public writeString(str: string = '', enc: BufferEncoding = 'utf-8') {
    const buf = Buffer.from(str, enc)
    return this.writeBytesWithLength(buf)
  }

  public writeAddress(address: string) {
    const addressBytes = Address.fromString(address).toBytes()
    return this.write(addressBytes)
  }

  public writeAddressWithLength(address: string) {
    const addressBytes = Address.fromString(address).toBytes()
    return this.writeBytesWithLength(addressBytes)
  }

  public writeHash(hash: string) {
    const buf = Buffer.from(hash, 'hex')
    return this.write(buf)
  }

  public writeBoolean(v: boolean) {
    return this.writeUInt(v ? 1 : 0, 1)
  }

  public writeBigInt(n: number | BN) {
    n = n instanceof BN ? n : new BN(n + '')
    const buf = n.toBuffer('le', 32)
    return this.write(buf)
  }

  public writeDoubleLE(n: number) {
    const buf = Buffer.allocUnsafe(8)
    buf.writeDoubleLE(n, 0)
    return this.write(buf)
  }

  public toBuffer() {
    return this.concat()
  }

  public concat() {
    return Buffer.concat(this.bufs, this.size)
  }

  public write(buf: Buffer): this {
    this.bufs.push(buf)
    this.size += buf.length
    return this
  }

  public writeUInt(
    value: number,
    count: number = 1,
    endian: 'le' | 'be' = 'le',
  ): this {
    const buf = Buffer.allocUnsafe(count)

    if (endian === 'le') {
      buf.writeUIntLE(value, 0, count)
    } else {
      buf.writeUIntBE(value, 0, count)
    }

    return this.write(buf)
  }

  public writeInt(
    value: number,
    count: number = 1,
    endian: 'le' | 'be' = 'le',
  ): this {
    const buf = Buffer.allocUnsafe(count)

    if (endian === 'le') {
      buf.writeIntLE(value, 0, count)
    } else {
      buf.writeIntBE(value, 0, count)
    }

    return this.write(buf)
  }

  public writeInt64BE(n: number | BN) {
    n = n instanceof BN ? n : new BN(n + '')
    const buf = n.toBuffer('be', 8)
    return this.write(buf)
  }

  public writeInt64LE(n: number | BN) {
    n = n instanceof BN ? n : new BN(n + '')
    const buf = n.toBuffer('le', 8)
    return this.write(buf)
  }

  public writeVarintNum(n: number | BN) {
    const buf = this.varintBufNum(n)
    return this.write(buf)
  }

  private varintBufNum(n: number | BN) {
    let buf
    n = n instanceof BN ? n.toNumber() : n

    if (n < 253) {
      buf = Buffer.allocUnsafe(1)
      buf.writeUInt8(n, 0)
    } else if (n < 0x10000) {
      buf = Buffer.allocUnsafe(1 + 2)
      buf.writeUInt8(253, 0)
      buf.writeUInt16LE(n, 1)
    } else if (n < 0x100000000) {
      buf = Buffer.allocUnsafe(1 + 4)
      buf.writeUInt8(254, 0)
      buf.writeUInt32LE(n, 1)
    } else {
      const s = new NulsSerializer()
      s.writeUInt(255, 1)
      s.writeInt64LE(new BN(n + ''))
      buf = s.concat()
      // buf = Buffer.allocUnsafe(1 + 8)
      // buf.writeUInt8(255, 0)
      // buf.writeInt32LE(n & -1, 1)
      // buf.writeUInt32LE(Math.floor(n / 0x100000000), 5)
    }
    return buf
  }
}

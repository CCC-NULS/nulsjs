import BN from 'bn.js'
import {Address} from './address'
import {hashLength} from './common'

export class NulsParser {
  protected static addressLength = Address.bytesLength
  protected static placeholder = 0x00

  protected offset: number = 0
  protected size: number
  protected buf: Buffer

  public constructor(buf: Buffer) {
    this.buf = buf
    this.size = buf.length
  }

  public readBytesWithLength(): Buffer {
    const placeholder = this.buf.readUInt8(this.offset)

    if (placeholder === NulsParser.placeholder) {
      this.offset++
      return Buffer.from([])
    }

    const n = this.readVarintNum()
    const length = n instanceof BN ? n.toNumber() : n

    const bytes = this.buf.slice(this.offset, this.offset + length)
    this.offset += length

    return bytes
  }

  public read(count: number, endian: 'le' | 'be' = 'le'): number {
    let res

    if (endian === 'le') {
      res = this.buf.readUIntLE(this.offset, count)
    } else {
      res = this.buf.readUIntBE(this.offset, count)
    }

    this.offset += count
    return res
  }

  public readString(): string {
    const bytes = this.readBytesWithLength()
    return bytes.toString('utf8')
  }

  public readAddress(): string {
    const buf = this.buf.slice(
      this.offset,
      this.offset + NulsParser.addressLength,
    )
    const address = Address.fromBytes(buf).address
    this.offset += NulsParser.addressLength
    return address
  }

  public readAddressWithLength(): string {
    const bytes = this.readBytesWithLength()
    return Address.fromBytes(bytes).address
  }

  public readHash(): string {
    const buf = this.buf.slice(this.offset, this.offset + hashLength)
    const hash = buf.toString('hex')
    this.offset += hashLength
    return hash
  }

  public readBoolean(): boolean {
    const n = this.read(1)
    return !!n
  }

  public readBigInt(): BN {
    const buf = this.buf.slice(this.offset, this.offset + 32)
    this.offset += 32
    return new BN(buf, 10, 'le')
  }

  public readDoubleLE(): number {
    const n = this.buf.readDoubleLE(this.offset)
    this.offset += 8
    return n
  }

  public readUInt64BE(): BN {
    const buf = this.buf.slice(this.offset, this.offset + 8).reverse()
    this.offset += 8
    return new BN(buf, 10, 'be')
  }

  public readUInt64LE(): BN {
    const buf = this.buf.slice(this.offset, this.offset + 8)
    this.offset += 8
    return new BN(buf, 10, 'le')
  }

  public length(): number {
    return this.buf.length - this.offset
  }

  public slice(length?: number): Buffer {
    const n = length ? this.offset + length : this.buf.length - 1
    const bytes = this.buf.slice(this.offset, n)
    this.offset += n - this.offset
    return bytes
  }

  public readVarintNum(): number | BN {
    let n = this.read(1)

    if (n < 253) {
      return n
    } else if (n < 0x10000) {
      return this.read(2)
    } else if (n < 0x100000000) {
      return this.read(4)
    } else {
      return this.readUInt64LE()
    }
  }
}

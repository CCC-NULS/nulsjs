import {ChainId, ChainIdPrefix, V1ChainIdType, ChainIdV1ToV2} from './common'
import {bs58Encode, bs58Decode, ripemd160, sha256} from './crypto/hash'

export enum AddressType {
  Default = 1,
  Contract = 2,
}

export class Address {
  public chainId!: ChainId
  public type!: AddressType
  public publicKeyHash!: Buffer
  public prefix?: string
  public address!: string

  public static from(
    chainId: ChainId,
    type: AddressType,
    publicKey: Buffer,
    prefix?: string,
  ): Address {
    const addr = new Address()
    addr.chainId = chainId
    addr.type = type
    addr.publicKeyHash = this.getPublicKeyHash(publicKey)
    addr.prefix = this.getPrefix(chainId, prefix)
    addr.address = this.getAddressString(
      chainId,
      type,
      addr.publicKeyHash,
      addr.prefix,
    )
    return addr
  }

  public static fromString(address: string): Address {
    const addr = new Address()

    let prefix!: string
    let tmpAddress!: string
    const prefixes: string[] = Object.values(ChainIdPrefix)

    for (let i = 0; i < prefixes.length; i++) {
      prefix = prefixes[i]
      if (address.startsWith(prefix)) {
        tmpAddress = address.substr(prefix.length + 1)
        break
      }
    }

    if (!tmpAddress) {
      for (let i = 0; i < address.length; i++) {
        const val = address.charAt(i)
        if (val.charCodeAt(0) >= 97) {
          prefix = address.substr(0, i)
          tmpAddress = address.substr(i + 1)
          break
        }
      }
    }

    const bytes = bs58Decode(tmpAddress)
    const xor = bytes[bytes.length - 1]
    const addressBytes = bytes.slice(0, bytes.length - 1)
    const goodXor = this.getXOR(addressBytes)

    if (xor !== goodXor) {
      throw new Error('Invalid Address')
    }

    addr.chainId = addressBytes.readUInt16LE(0)
    addr.type = addressBytes.readUInt8(2)
    addr.publicKeyHash = addressBytes.slice(3)
    addr.prefix = prefix
    addr.address = address

    return addr
  }

  public static fromStringV1(addressV1: string): Address {
    const bytes = bs58Decode(addressV1)
    const xor = bytes[bytes.length - 1]
    const addressBytes = bytes.slice(0, bytes.length - 1)
    const goodXor = this.getXOR(addressBytes)

    if (xor !== goodXor) {
      throw new Error('Invalid Address')
    }

    const addr = new Address()
    addr.chainId = ChainIdV1ToV2[addressBytes.readUInt16LE(0) as V1ChainIdType]
    addr.type = addressBytes.readUInt8(2)
    addr.publicKeyHash = addressBytes.slice(3)
    addr.prefix = this.getPrefix(addr.chainId)
    addr.address = this.getAddressString(
      addr.chainId,
      addr.type,
      addr.publicKeyHash,
      addr.prefix,
    )
    return addr
  }

  public static verify(address: string): boolean {
    try {
      this.fromString(address)
      return true
    } catch (err) {
      return false
    }
  }

  public static checkV1Address(addressV1: string, addressV2: string): boolean {
    const addr = this.fromStringV1(addressV1)
    return addr.address === addressV2
  }

  private static getChainIdBuffer(chainId: ChainId): Buffer {
    return Buffer.from([0xff & (chainId >> 0), 0xff & (chainId >> 8)])
  }

  private static getPrefix(chainId: ChainId, prefix?: string): string {
    let p = ChainIdPrefix[chainId] || ''

    if (!p) {
      if (prefix) {
        p = prefix.toUpperCase()
      } else {
        const chainIdBuffer = this.getChainIdBuffer(chainId)
        p = bs58Encode(chainIdBuffer).toUpperCase()
      }
    }

    p += ['a', 'b', 'c', 'd', 'e'][p.length - 1]

    return p
  }

  private static getXOR(addressBytes: Buffer): number {
    return addressBytes.reduce(
      (xor: number, byte: number) => (xor ^= byte),
      0x00,
    )
  }

  private static getPublicKeyHash(publicKey: Buffer): Buffer {
    return ripemd160(sha256(publicKey))
  }

  private static getAddressBytes(
    chainId: ChainId,
    type: AddressType,
    publicKeyHash: Buffer,
  ): Buffer {
    const chainIdBuffer = this.getChainIdBuffer(chainId)
    return Buffer.concat([chainIdBuffer, Buffer.from([type]), publicKeyHash])
  }

  private static getAddressString(
    chainId: ChainId,
    type: AddressType,
    publicKeyHash: Buffer,
    prefix?: string,
  ): string {
    const addressBytes = this.getAddressBytes(chainId, type, publicKeyHash)
    const xor = this.getXOR(addressBytes)
    const addressBytesWithXor = Buffer.concat([
      addressBytes,
      Buffer.from([xor]),
    ])

    return prefix + bs58Encode(addressBytesWithXor)
  }

  public toString() {
    return this.address
  }
}

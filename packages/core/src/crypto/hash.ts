import crypto from 'crypto'
import bs58 from 'bs58'

export function sha256(data: Buffer): Buffer {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest()
}

export function ripemd160(data: Buffer): Buffer {
  return crypto
    .createHash('ripemd160')
    .update(data)
    .digest()
}

export function bs58Encode(data: Buffer): string {
  return bs58.encode(data)
}

export function bs58Decode(data: string): Buffer {
  return bs58.decode(data)
}

import crypto from 'crypto'

export function getRandomBytes(bytes: number): Buffer {
  return crypto.randomBytes(bytes)
}

export function getKeyAsBuffer(key: string | Buffer): Buffer {
  return Buffer.isBuffer(key) ? key : Buffer.from(key, 'hex')
}

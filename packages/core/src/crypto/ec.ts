import secp256k1 from 'secp256k1'
import {getKeyAsBuffer, getRandomBytes} from './common'

export interface ECKeyPair {
  privateKey: Buffer
  publicKey: Buffer
}

export function createECPrivateKey(): Buffer {
  let privateKey: Buffer
  do {
    privateKey = getRandomBytes(32)
  } while (!secp256k1.privateKeyVerify(privateKey))
  return privateKey
}

export function deriveECPublicKey(privateKey: Buffer): Buffer {
  return secp256k1.publicKeyCreate(privateKey)
}

export function signEC(data: Buffer, privateKey: string): Buffer
export function signEC(data: Buffer, privateKey: Buffer): Buffer
export function signEC(data: Buffer, privateKey: string | Buffer): Buffer {
  const privateKeyBuf = getKeyAsBuffer(privateKey)
  const {signature} = secp256k1.sign(data, privateKeyBuf)
  return secp256k1.signatureExport(signature)
}

export function verifyEC(data: Buffer, sign: Buffer, publicKey: string): boolean
export function verifyEC(data: Buffer, sign: Buffer, publicKey: Buffer): boolean
export function verifyEC(
  data: Buffer,
  sign: Buffer,
  publicKey: string | Buffer,
): boolean {
  const publicKeyBuf = getKeyAsBuffer(publicKey)
  const signature = secp256k1.signatureImport(sign)
  return secp256k1.verify(data, signature, publicKeyBuf)
}

export function createECKeyPair(): ECKeyPair {
  const privateKey = createECPrivateKey()
  const publicKey = deriveECPublicKey(privateKey)

  return {
    privateKey,
    publicKey,
  }
}

export function validateKeyPair(keyPair: ECKeyPair): boolean {
  const msg: Buffer = getRandomBytes(32)
  const signature = signEC(msg, keyPair.privateKey)

  if (!verifyEC(msg, signature, keyPair.publicKey)) {
    throw new Error('Something went wrong when validating the signature.')
  }

  return true
}

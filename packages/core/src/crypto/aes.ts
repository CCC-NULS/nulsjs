import {getKeyAsBuffer} from './common'
import aes from 'crypto-js/aes'
import hex from 'crypto-js/enc-hex'
import {mode, pad} from 'crypto-js'
import {sha256} from './hash'

export const AES_IV = hex.parse('0000000000000000')
const config = {
  iv: AES_IV,
  mode: mode.CBC,
  padding: pad.Pkcs7,
}

function getKey(password: string): string {
  return sha256(getKeyAsBuffer(password)).toString('hex')
}

export function encryptAES(data: Buffer, password: string): Buffer {
  const dataHex = data.toString('hex')
  const key = getKey(password)
  const encrypted = aes.encrypt(hex.parse(dataHex), hex.parse(key), config)
  return Buffer.from(encrypted.toString(), 'base64')
}

export function decryptAES(data: Buffer, password: string): Buffer {
  const dataBase64 = data.toString('base64')
  const key = getKey(password)
  const decrypted = aes.decrypt(dataBase64, hex.parse(key), config)
  return Buffer.from(decrypted.toString(), 'hex')
}

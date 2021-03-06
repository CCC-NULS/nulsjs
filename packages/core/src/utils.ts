import {Address} from './address'
import {hashLength} from './common'

const hexRegEx = new RegExp('^[0-9a-fA-F]+$', 'gi')

export function isHex(input: string): boolean {
  return hexRegEx.test(input) && input.length % 2 === 0
}

export const NULS_DECIMALS = 8
export const NULS_BASE: number = 10 ** 8

export function nulsToNa(nuls: number): number {
  return Math.round(nuls * NULS_BASE)
}

export function naToNuls(na: number): number {
  return na / NULS_BASE
}

export function isValidAddress(address: string): boolean {
  try {
    Address.fromString(address)
    return true
  } catch (e) {
    return false
  }
}

export function isValidHash(hash: string): boolean {
  return hash.length / 2 === hashLength
}

const hexRegEx = new RegExp('^[0-9a-fA-F]+$', 'gi')

export function isHex(input: string): boolean {
  return hexRegEx.test(input) && input.length % 2 === 0
}

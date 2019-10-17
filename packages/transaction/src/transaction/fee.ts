export const MIN_FEE_PRICE_1024_BYTES = 100000
export const MAX_FEE_PRICE_1024_BYTES = 1000000
const KB = 1024

export function getTxFee(
  txSize: number,
  signsCount: number,
  price: number = MIN_FEE_PRICE_1024_BYTES,
) {
  txSize += signsCount * 110
  return price * Math.ceil(txSize / KB)
}

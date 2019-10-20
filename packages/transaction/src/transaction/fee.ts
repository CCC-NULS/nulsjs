export const MIN_FEE_PRICE_1024_BYTES = 100000
export const MAX_FEE_PRICE_1024_BYTES = 1000000
const KB = 1024

export function getTxFee(
  txSize: number,
  price: number = MIN_FEE_PRICE_1024_BYTES,
  minFee: number = price,
) {
  // txSize += signsCount * 110 => varBuffer 106bytes + [1-4]bytes
  return Math.max(minFee, price * Math.ceil(txSize / KB))
}

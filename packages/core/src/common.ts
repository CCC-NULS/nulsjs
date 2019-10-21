export enum ChainId {
  Mainnet = 1,
  Testnet = 2,
}

export enum V1ChainIdType {
  Mainnet = 8964,
  Testnet = 261,
}

export const ChainIdV1ToV2: Record<V1ChainIdType, ChainId> = {
  [V1ChainIdType.Mainnet]: ChainId.Mainnet,
  [V1ChainIdType.Testnet]: ChainId.Testnet,
}

export const ChainIdPrefix: Record<ChainId, string> = {
  [ChainId.Mainnet]: 'NULS',
  [ChainId.Testnet]: 'tNULS',
}

export const BlackHoleAddress = {
  [ChainId.Mainnet]: 'NULSd6HgWSU1iR6BfNoQi85mAMT52JMFzpnok',
  [ChainId.Testnet]: 'tNULSeBaMhZnRteniCy3UZqPjTbnWKBPHX1a5d',
}

export enum BlockVersion {
  NotDefined = -1,
  FirstVersion = 1,
  SmartContracts = 2,
}

# Core package
This package is the cornerstone of the NULS SDK, it is needed by the rest of packages to work properly. Besides this, you can use some of the utils provided for your own use case.

## Address class
This class provides som utilities to operate with NULS addresses.
It expose this public interface:

```ts
class Address {
  chainId: number
  type: number
  publicKeyHash: Buffer
  prefix: string
  address: string

  static fromBytes(bytes: Buffer): Address
  static from(chainId: number, type: number, publicKey: Buffer, prefix?: string): Address
  static fromString(address: string): Address
  static fromStringV1(addressV1: string): Address
  static verify(address: string): boolean
  toBytes(): Buffer
  toString(): string
}
```

#### Serialize / parse an address

```js
import {Address} from '@nuls.io/core'

const bytes = Address.fromString('NULSd6HgWaHQwRadfbxn2CFsGppG6ysyqML6m').toBytes()
console.log(bytes)
// <Buffer 01 00 01 2c 00 e3 2b 8c 04 c2 4f 74 3e 2a a0 35 e6 e5 c0 71 e5 be 67>

const address = Address.fromBytes(bytes).toString()
console.log(address)
// NULSd6HgWaHQwRadfbxn2CFsGppG6ysyqML6m
```

#### Get address meta information

```js
import {Address} from '@nuls.io/core'

const address = Address.fromString('tNULSeBaMsvXgCBnaJ4u7rbQEKiWd23VWCudYm')
console.log(address)
// {
//   chainId: 2,
//   type: 1,
//   publicKeyHash: <Buffer d2 40 9a 8e d9 c2 a2 60 f0 82 73 33 b7 b3 09 86 77 eb 37 7c>,
//   prefix: 'tNULS',
//   address: 'tNULSeBaMsvXgCBnaJ4u7rbQEKiWd23VWCudYm'
// }
```

#### Verify if an address is valid

```js
import {Address} from '@nuls.io/core'

console.log(Address.verify('NULSd6HgdemcQDAaiEJWq9ESMhtUHXRsNJ4KM'))
// true
```

#### Convert an v1 address into v2

```js
import {Address} from '@nuls.io/core'

const v2Address = Address.fromStringV1('NsdvprVBQbZLRnXPKiZFBzUbgnnHqi3d').toString()
console.log(v2Address)
// NULSd6HgWaHQwRadfbxn2CFsGppG6ysyqML6m
```

## Block API
This class is util to fetch block related information from the blockchain.
All operations go by default through the [__public official NULS explorer API__](https://nulscan.io/). But it is up to you to configure your own NULS node host as API provider

```ts
class BlockApi {
  constructor(config?: ApiServiceConfig)

  async getBlockHeaders(packingAddress?: string, pageNumber?: number, pageSize?: number): Promise<BlockHeaderListResponse>

  async getBlock(blockHeight: number): Promise<BlockResponse> 
}
```

#### Fetch block info by height

```js
import {BlockApi} from '@nuls.io/core'

const blockApi = new BlockApi({
  url: 'https://nulscan.io',
  chainId: 1,
})

const block = await blockApi.getBlock(295008)

console.log(block)
// {
//   header: {
//     hash: "754d75ef82ddec265...",
//     height: 295008,
//     ...
//   },
//   txList: [
//     {
//       hash: "5c57ca040ffe16...",
//       type: 1,
//       ...
//     }
//   ],
//   blockHex: "cf24ab70c307edd78..."
// }
```

## Transaction API
This class is util to fetch transaction related information from the blockchain.
All operations go by default through the [__public official NULS explorer API__](https://nulscan.io/). But it is up to you to configure your own NULS node host as API provider

```ts
class TransactionApi {
  constructor(config?: ApiServiceConfig)
  async getTransactions(type: TransactionType, pageNumber?: number, pageSize?: number): Promise<TransactionListResponse>
  async getTransaction(txHash: string): Promise<TransactionResponse>
  async validateTransaction(txHex: string): Promise<ValidateTxResponse>
  async broadcast(txHex: string): Promise<BroadcastTxResponse>
}
```

#### Fetch transaction info by hash

```js
import {TransactionApi} from '@nuls.io/transaction'

const transactionApi = new TransactionApi({
  url: 'https://nulscan.io',
  chainId: 1,
})

const tx = await transactionApi.getTransaction('ad2ad7bc2f5f002bf58a607f1ba3cb4cbb951d1df9a882ad9b68d76618838e7d')

console.log(tx)
// {
//   hash: "ad2ad7bc2f5f002bf58a607f1ba3cb4cbb951d1df9a882ad9b68d76618838e7d",
//   type: 4,
//   height: 5575,
//   size: 357,
//   ...
// }
```
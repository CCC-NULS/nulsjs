# Cancel Deposit transaction

The cancel deposit or unstake transaction is part of the NULS __proof of credit (POC)__ consensus and will allow us to unlock an amount of NULS previously deposited in some consensus node. We can use the following methods to set it up:

- `".depositHash(hash: string)"` The _hash_ of the transaction where the deposit was effectuated

```js
import {nulsToNa} from '@nuls.io/core'
import {CancelDepositTransaction} from '@nuls.io/transaction'

const stakerPrivateKey = '35daf771d7591e0a3021031efd561e97e2049bfe0ed7dd1a585330c721077d2b'
const depositHash = 'ad2ad7bc2f5f002bf58a607f1ba3cb4cbb951d1df9a882ad9b68d76618838e7d'

const tx = new CancelDepositTransaction()
  .depositHash(depositHash)
  .sign(stakerPrivateKey)

const txReceipt = await tx.send()
```

::: warning
The transaction must be signed by the account that did the deposit. In other words, we have to provide the __private key__ of the account that did the deposit.
:::

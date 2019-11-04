# Deposit transaction

The deposit transaction or stake transaction is part of the NULS __proof of credit (POC)__ consensus and will allow you to __lock__ an amount of NULS in the desired consensus node, and to be rewarded for deposit our trust in that node. We can use the following methods to set it up:

- `".address(address: string)"` The _address_ of the account that will make the deposit
- `".node(hash: string)"` The _hash_ of the consensus node where the deposit will be effectuated
- `".deposit(amount: number)"` The amount of NULS (in NA's) that will be _deposited_ in the consensus node (should be greater than 2k NULS)

```js
import {nulsToNa} from '@nuls.io/core'
import {DepositTransaction} from '@nuls.io/transaction'

const stakerAddress = 'NULSd6HgaHd7xnnHFkAh8VEAdDu4PyWFyRvw2'
const stakerPrivateKey = '35daf771d7591e0a3021031efd561e97e2049bfe0ed7dd1a585330c721077d2b'
const nodeHash = 'ad2ad7bc2f5f002bf58a607f1ba3cb4cbb951d1df9a882ad9b68d76618838e7d'

const tx = new DepositTransaction()
  .from(stakerAddress)
  .node(nodeHash)
  .deposit(nulsToNa(2000))
  .sign(stakerPrivateKey)

const txReceipt = await tx.send()
```

::: tip
The transaction hash resultant of sending this transaction (`txReceipt.hash`), will be needed when we will 
want to unstake our deposit from this consensus node.
:::

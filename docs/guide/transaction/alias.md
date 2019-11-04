# Alias transaction

The alias transaction allow you to give an alias to one account by paying a __fixed fee of 1 NULS__ (apart from the common transaction size fee). The only thing needed to be configured is:

- `".from(address: string)"` The _address_ of the account to be aliased
- `".alias(alias: string)"` The _alias_ as plain text

```js
import {AliasTransaction} from '@nuls.io/transaction'

const fromAddress = 'NULSd6HgaHd7xnnHFkAh8VEAdDu4PyWFyRvw2'
const privateKey = '35daf771d7591e0a3021031efd561e97e2049bfe0ed7dd1a585330c721077d2b'

const tx = AliasTransaction
  .from(fromAddress)
  .alias('my_alias')
  .sign(privateKey)

const txReceipt = await tx.send()
```

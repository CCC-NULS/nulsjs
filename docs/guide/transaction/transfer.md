# Transfer transaction

The transfer transaction is the most basic transaction that we can make in the NULS blockchain. It is used to 
transfer nuls from one account to another. We can use the following methods to configure it:

- `".from(address: string, amount?: number)"` Send _amount_ NULS __from__ the account identified by _address_ (If we dont specify any fixed _amount_, it will be calculated based on the outputs _amount_)
- `".to(address: string, amount?: number)"` Send _amount_ NULS __to__ the account identified by _address_ (If we dont specify any fixed _amount_, all specified input balance will be transfered to this account)
- `".remark(remark: string)"` Add a _remark_ in plain text to the transaction

```js
import {nulsToNa} from '@nuls.io/core'
import {TransferTransaction} from '@nuls.io/transaction'

const fromAddress = 'NULSd6HgaHd7xnnHFkAh8VEAdDu4PyWFyRvw2'
const privateKey = '35daf771d7591e0a3021031efd561e97e2049bfe0ed7dd1a585330c721077d2b'
const toAddress = 'NULSd6HggwmkquJfskMhZ9iwJg4B724kvWiR4'
const anotherAddress = 'NULSd6HgdemcQDAaiEJWq9ESMhtUHXRsNJ4KM'

const config = {
  api: {
    host: 'https://nulscan.io',
    apiBase: '/api/'
  }
}

// Send 1.7 NULS to "toAddress" and the rest of available balance in "fromAddress" to "anotherAddress" paying 2 NULS as fee 
const tx = new TransferTransaction(config)
  .from(fromAddress)
  .to(toAddress, nulsToNa(1.7))
  .to(anotherAddress)
  .fee(nulsToNa(2))
  .remark('test transfer :)')
  .sign(privateKey)

const txReceipt = await tx.send()
```
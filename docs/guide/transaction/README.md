# Transaction package
This package provides all the necessary to send transactions to the NULS blockchain and obtain information from it

## Transaction basic concepts

__NULS SDK__ provides a very simple API for creating transactions. We expect this API to be accessible for developers without knowing the working internals of nuls in deep detail. What follows is a small introduction to transactions with some basic knowledge required to use this API.

Each transaction may contain a set of inputs and outputs. Each input must declare a reference to the latest previous transaction made by the same account. This reference is called a `nonce` and it is indentified by the latest `16` digits of the latest _transaction hash_.

So, in order to send a valid transaction, you must know the `nonce` of the latest transaction made by the same account. Fortunately, the SDK will handle it internally for you.

Unlike other blockchain platforms, NULS has been designed to support different kinds of transactions, that we will cover along this guide.
Let's take a look at the simplier transaction we can make.

## Transaction example

We are going to send `1 NULS` from the accoutn identified by `fromAddress`, to the account identified by `toAddress`. To achieve this we need to provide the `privateKey` of the `fromAddress` account.

```js
import {nulsToNa} from '@nuls.io/core'
import {TransferTransaction} from '@nuls.io/transaction'

const fromAddress = 'NULSd6HgaHd7xnnHFkAh8VEAdDu4PyWFyRvw2'
const privateKey = '35daf771d7591e0a3021031efd561e97e2049bfe0ed7dd1a585330c721077d2b'
const toAddress = 'NULSd6HggwmkquJfskMhZ9iwJg4B724kvWiR4'

new TransferTransaction()
  .from(fromAddress)          // The transaction will be composed with inputs calculated from this account
  .to(toAddress, nulsToNa(1)) // This will send 1 NULS to the account identified by it public address "toAddress"
  .sign(privateKey)           // We have to provide the private key of the account that owns the inputs 
  .send()                     // The transaction will be sent to the NULS network and added to the pending transaction pool
```

## Destination address

To specify the accounts which will receive the transfered amount we have to use the method `.to(address: string, amount: number)`. This is translated internally as a transaction output. We also can transfer NULS to different accounts at once, to achieve that we can add as much outputs as we need:

```js
import {nulsToNa} from '@nuls.io/core'
import {TransferTransaction} from '@nuls.io/transaction'

new TransferTransaction()
  .from(fromAddress)
  .to(address, nulsToNa(100))         // Send 100 NULS to "address" account
  .to(otherAddress, nulsToNa(0.005))  // Send 0.005 NULS to "otherAddress" account
  .to(anotherOne, 100000000)          // Send 1 NULS to "anotherOne" account
  ...
```

## NULS and NA's

As we have seen previously we are using the method `.to(address: string, amount: number)` of the `TransferTransaction` class to specify de destination address that will receive the transfer, and the amount of nuls transfered. 

Homologously to other blockchains platforms which has fungible tokens like __Bitcoin (satoshis)__ or __Ethereum (weis)__, we need to specify the amount of tokens to be sent as __"NA" (NULS amount)__ beign:
- 1 NA = 1/10^8 NULS
- 1 NULS = 10^8 NA 

As we are used to work with __NULS__ and fractions of it instead of __NA__, to ease this swapping __NULS SDK__ provides some helper functions to do the conversion of the amount to the corresponding precission.

```js
import {nulsToNa, naToNuls} from '@nuls.io/core'

nulsToNa(0.5)        // 0.5 NULS -> 50000000 NA
nulsToNa(0.00000001) // 0.00000001 NULS -> 1 NA

naToNuls(70000000)   // 70000000 NA -> 70 NULS
naToNuls(1)          // 1 NA -> 0.00000001 NULS
```

## Transaction remark

We can add a remark in all kind of transactions that will be stored along with the transaction itself. To set it up we have to use the method `.remark(text: string)` available in all different Transaction classes.

```js
import {TransferTransaction} from '@nuls.io/transaction'

new TransferTransaction()
  .from(fromAddress)
  ...
  .remark('This is a custom remark that will be stored as part of my transaction')
  ...
```

::: warning
The remark should be a plain text encoded in `utf-8`
:::

## Transaction fee

By default the transaction fee is calculated depending on the size of the serialized transaction in kilobytes. For each __1024 bytes (1 KB)__, we need to pay __"fee price"__ NULS in concept of fee. Depending on the transaction type, the __fee price__ can be more or less.

There is a default transaction fee of __100000 NA (0.001 NULS)__ per __1 KB__

So for example, a transaction of type _TransferTransaction_ which size in bytes is __27500__ (__27500__ / __1024__ ~= __27__ ) will have a fee of (__100000 NA__ * __27__ = __2700000 NA__) that is exactly __0.027 NULS__.

The total fee is automatically added to the amount being transfered, so we need to have enough balance in the account to pay the whole amount: __transfer amount__ + __fee__.

This is the minimum required fee to make the transaction valid, but we can customize the fee to prioritize our transaction over others when packed in a block. The miner who include this transaction in a block will earn the extra fee as rewards. 

To achieve this we can use the method `.fee(amount: number)` available in all different Transaction classes. The _fee amount_ should be provided in _NA's_.

```js
import {nulsToNa} from '@nuls.io/core'
import {TransferTransaction} from '@nuls.io/transaction'

new TransferTransaction()
  .from(fromAddress)
  ...
  .fee(nulsToNa(1))  // Giving 1 NULS as an extra fixed fee
  ...
```

## Sign a transaction

Once we have our transaction configured, we need to sign it before sending it to the network. To make this we need to provide the private key of the account that owns funds being transfered.

To sign the transaction we need to call the method `.sign(privateKey: string)` of the `TransferTransaction` class.

```js
import {TransferTransaction} from '@nuls.io/transaction'

new TransferTransaction()
  .from(fromAddress)
  ...
  .sign(privateKey)
  ...
```

::: warning
Once we have signed the transaction, we can not modify it. If we try to modify it by adding one more output for example, the signature will be cleared and we will need to call the `sign` method again.
:::

## Broadcast a transaction

We can broadcast a transaction to the NULS network using the method `.send(config?: TransactionConfig)` of the `TransferTransaction` class. This will send our locally signed transaction to one of the NULS nodes using an explorer api previously configured.

We can set up our favorite explorer api host that will handle the transaction by passing it as part of the configuration object in the constructor function of the class. Here is an example doing this:

```js
import {TransferTransaction} from '@nuls.io/transaction'

// Setting it up by passing the config as argument of .send() method
new TransferTransaction({
  api: { url: 'https://nulscan.io/api/' }
})
  .from(fromAddress)
  ...
  .sign(privateKey)
  .send()
```

::: warning
The transaction should have been signed before broadcasting it, if not an exception will be thrown
:::

### Transaction sent returned type

The send method returns an especial object of type `PromiEvent`, which is half `EventEmitter`, and half `Promise`. This will be resolved when the transaction receipt will be available. Additionally the following events are emitted:

- `"txHash"` Once the transaction has been sent and it is in the pending transaction pool of the network waiting to be mined. An string is emitted along with the event, containing the transaction hash that identifies this transaction in the network
- `"txReceipt"` Once the transaction has be mined in some block. A mined transaction object is emitted along with the event

```js
import {TransferTransaction} from '@nuls.io/transaction'

const tx = new TransferTransaction()
  .from(fromAddress)
  ...
  .send()

tx.on('txHash', (hash) => {

  console.log(hash)
  // 0020ec3215758304ca3f055a99517236fc996dabdf02fb806e4dfb76539ee43c0752

})

tx.on('txReceipt', (receipt) => {

  console.log(receipt.hash)
  // 0020ec3215758304ca3f055a99517236fc996dabdf02fb806e4dfb76539ee43c0752

  console.log(receipt.height)
  // 663692

})

// Using it as a promise
tx.then((receipt) => {

  console.log(receipt.type)
  // 2

}).catch((error) => {

  console.error(error)
  // Error: There was an error sending the transaction to the network

})

```

::: tip
By default there are some validations that are done before sending the transaction. You can skip this validations forcing it to be sent by overriding the default configuration with:

```js
import {TransferTransaction} from '@nuls.io/transaction'

new TransferTransaction({
  safeCheck: false
})
  .from(fromAddress)
  ...
```
:::

## Serialize a transaction

The `.send()` method of the `TransferTransaction` class already does an implicit serialization before sending the transaction, but in some cases maybe we will want to get the serialized transaction to send it directly through our local node. The Transaction api provides a method to get the serialized transaction. We just need to call it:

```js
import {TransferTransaction} from '@nuls.io/transaction'

const txHex = TransferTransaction
  .from(fromAddress)
  ...
  .serialize()

console.log(txHex)
// f14e2c72549d1ccb34527491559e0ab33dc98395980f2a7db335ff90f10b9cee28001c94ca4215c8501b41cae5e0be7e...
```

::: tip
All the validations are already executed when serializing a transaction
:::

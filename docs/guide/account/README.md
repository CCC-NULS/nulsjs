# Account package
The account package contains all the necessary to handle account generation, importing, decryption and encryption.

## Account class
This class represents a full account of the NULS blockchain. By default the standard account __address type__ is `1 (Default)` and the __chain id__ is `1 (Mainnet)`. You can change these arguments yourself by providing them as parameters, read [Address Type and ChainId](#address-type-and-chainid)

#### Quick Start
```js
import {ChainId} from '@nuls.io/core'
import {Account} from '@nuls.io/account'

const fooAccount = account.create() // Creates an account
const barAccount = account.create(ChainId.Mainnet, PASSWORD) // Creates an account with a password

const fooAccount = account.import(PLAIN_TEXT_PRIVATE_KEY) // Imports a plain text private key
const barAccount = account.import(PLAIN_TEXT_PRIVATE_KEY, ChainId.Mainnet, PASSWORD) // Imports a plain text private key and encrypts it
const flobAccount = account.import(ENCRYPTED_PRIVATE_KEY, ChainId.Mainnet, PASSWORD) // Imports an encrypted private key
```

## Create a new account
Accounts can be created easily and safety on the frontend. By calling the static method `create` and `import`, we will get an instance of the `Account` class. If you provide a password, the account private key will be encrypted

#### New account

```js
import {Account} from '@nuls.io/account'

const fooAccount = Account.create()
console.log(fooAccount)
// { 
//   chainId: 1,
//   address: 'NULSd6HgaHd7xnnHFkAh8VEAdDu4PyWFyRvw2',
//   publicKey: '02d91bf495f244c6354ccb5e7c6a0a5e77f4356566b74a87ff8aab40d46b6d260b',
//   privateKey: '35daf771d7591e0a3021031efd561e97e2049bfe0ed7dd1a585330c721077d2b'
// }
```

#### New encrypted account

```js
import {Account} from '@nuls.io/account'

const barAccount = Account.create(PASSWORD)
console.log(barAccount)
// {
//   chainId: 1,
//   address: 'NULSd6HggwmkquJfskMhZ9iwJg4B724kvWiR4',
//   publicKey: '03500b0de9ace8271ed447b482ce4f59c5d0fe02c61eadb340e2542025e5efaf68',
//   encryptedPrivateKey: 'c690d47a39bac5626814828fad901a674d58fb1d0c48680d808d0764c6dac98c567795046365f60c8d87ba5eec48fbd9'
// }
```

#### Fetch account balance
```js
import {ChainId} from '@nuls.io/core'
import {Account} from '@nuls.io/account'

const balance = await Account.getBalance('tNULSeBaMmTkgNtWA1jnyKBYKUC3vV4Sa57ovL')

// OR

const account = Account.import(PRIVATE_KEY, ChainId.Testnet)
const balance = await account.getBalance()

console.log(balance)
// {
//   'totalBalance': 403918380062471,
//   'balance': 283917780062471,
//   'timeLock': 0,
//   'consensusLock': 120000600000000,
//   'freeze': 120000600000000,
//   'nonce': '6ed19c0455e5bce8',
//   'nonceType': 1
// }
```

## Import an account
You can import an existing account by using the private key. The private key can be encrypted or decrypted,
if you provide just the private key it must be decrypted, if you provide an encrypted private key together with its password it will decrypt the private key, if you provide a password and a decrypted private key it will import it and encrypt the private key.

#### Unencrypted (plain text) Private Key
You can provide the unencrypted private key in plain text as the first `param` of the `import` method
```js
import {Account} from '@nuls.io/account'

const account = Account.import('2d5ed8706749f6d7c096772a075c027f56fae4148bacbf6c78b59df09f84b07b')
console.log(account.toObject())
// {
//   chainId: 1,
//   address: 'NULSd6HghvH1HwtTxPNoFLL4LhA1SWTmNyTdC',
//   publicKey: '033f4031d22289befe017472bb954b59d9ba043ce67fbc60c50ee3a48c56b89b1f',
//   privateKey: '2d5ed8706749f6d7c096772a075c027f56fae4148bacbf6c78b59df09f84b07b'
// }
```

#### Encrypted Private Key
If the private key you're providing is encrypted with a password, you can provide the
password as the third `param` in plain text and the encrypted private key as the first one.
```js
import {ChainId} from '@nuls.io/core'
import {Account} from '@nuls.io/account'

const account = Account.import(
  '3b15ee33df6669b13a3ea5ff0532e8570a9a92d8fd8f85de464ac15ecda5545b282c68214397198ec8fc40c52dcd2846',
  ChainId.Mainnet,
  'Password1!'
)
console.log(account.toObject())
// {
//   chainId: 1,
//   address: 'NULSd6HghvH1HwtTxPNoFLL4LhA1SWTmNyTdC',
//   publicKey: '033f4031d22289befe017472bb954b59d9ba043ce67fbc60c50ee3a48c56b89b1f',
//   encryptedPrivateKey: '3b15ee33df6669b13a3ea5ff0532e8570a9a92d8fd8f85de464ac15ecda5545b282c68214397198ec8fc40c52dcd2846'
// }
```

#### Encrypting an Unencrypted (plain text) Private Key
If you want to encrypt a private key you can provide the password and unecrypted private key,
the account will then be imported and encrypted.
```js
import {ChainId} from '@nuls.io/core'
import {Account} from '@nuls.io/account'

const account = Account.import(
  '2d5ed8706749f6d7c096772a075c027f56fae4148bacbf6c78b59df09f84b07b',
  ChainId.Mainnet,
  'Password1!'
)
console.log(account.toObject())
// {
//   chainId: 1,
//   address: 'NULSd6HghvH1HwtTxPNoFLL4LhA1SWTmNyTdC',
//   publicKey: '033f4031d22289befe017472bb954b59d9ba043ce67fbc60c50ee3a48c56b89b1f',
//   encryptedPrivateKey: '3b15ee33df6669b13a3ea5ff0532e8570a9a92d8fd8f85de464ac15ecda5545b282c68214397198ec8fc40c52dcd2846'
// }
```

## Address Type and ChainId
You can create or import accounts under different address types or chain ids by providing them as parameters
into the `create` or `import` functions as such:

```js
import {ChainId} from '@nuls.io/core'
import {Account} from '@nuls.io/account'

const fooAccount = Account.create(ChainId.Mainnet, PASSWORD, CHAIN_ID)
const barAccount = Account.import(PRIVATE_KEY, ChainId.Mainnet, PASSWORD, CHAIN_ID)
```

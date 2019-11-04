# Introduction
NULS SDK has been designed as a modular multi package javascript library that allows you to handle every day blockchain related tasks, like managing an account, make transfers, stake nuls in some consensus node, or interact with some smart contract building an awesome decentralized application.

## Overview
As you may already know, some of the most important tasks in blockchain needs to be acomplished from the client side of the application. Things like signing a transaction, or interact with an smart contract involves some security and operability concerns that this SDK solves. It exposes a developer friendly javascript API to allow you operate with the NULS blockchain even without a deeper understanding of blockchain concepts.

NULS SDK is divided in separated __npm packages__, each of them solves different issues, like account management, transaction building, or smart contract integration. There is a __core package__ which is used by all the rest and should be always installed along the others.

This packages are distributed in diferent formats: _ES modules_, _commonjs_ and _umd_, and are compatible with all differents javascript environments: _module bundlers_, _web_, _nodejs_ and _react-native_. 

## Getting Started

All the packages are distributed under the __@nuls.io__ namespace.
You should install NULS SDK packages as local dependencies in your project:

```bash
# In your existing project root folder
$ npm i @nuls.io/core @nuls.io/account @nuls.io/transaction
```

## Packages

NULS SDK is still in an initial development phase. In the next sections you will find a full description of the features availables in each package. This is a highlight of some of them:

- [Core](/guide/core/#core-package)
- [Account](/guide/account/#account-package)
- [Transaction](/guide/transaction/)

## Contributions
Contributions are welcome from anyone. You must follow the eslint rules outlined
in the project, You also must write your own tests for the fixes/features you develop.
You can find some technical help joining the official [NULS community in telegram](https://t.me/Nulsio)

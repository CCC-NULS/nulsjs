import {
  ChainId,
  createECKeyPair,
  AddressType,
  encryptAES,
  validateKeyPair,
  deriveECPublicKey,
  ECKeyPair,
  decryptAES,
  Address,
  ApiServiceConfig,
} from '@nuls/core'
import {AccountApi, AccountBalance} from './api'

export interface AccountInfo {
  chainId: ChainId
  address: string
  publicKey: string
  privateKey: string | null
  encryptedPrivateKey?: string
}

export class Account {
  private type!: AddressType
  private chainId!: ChainId
  private address!: string
  private privateKey!: Buffer
  private publicKey!: Buffer
  private encrypted!: boolean

  public static create(
    chainId: ChainId = ChainId.Mainnet,
    password?: string,
    prefix?: string,
  ): Account {
    const keyPair = createECKeyPair()
    return this.generateAccount(chainId, keyPair, password, prefix)
  }

  public static import(
    privateKey: string,
    chainId: ChainId = ChainId.Mainnet,
    password?: string,
    prefix?: string,
  ): Account {
    let privateKeyBuff = Buffer.from(privateKey, 'hex')

    if (password) {
      privateKeyBuff = decryptAES(privateKeyBuff, password)
    }

    const publicKey = deriveECPublicKey(privateKeyBuff)
    const keyPair = {
      privateKey: privateKeyBuff,
      publicKey,
    }

    validateKeyPair(keyPair)

    return this.generateAccount(chainId, keyPair, password, prefix)
  }

  public static async getBalance(
    address: string,
    chainId: ChainId = ChainId.Mainnet,
    assetId: number = 1,
    config?: ApiServiceConfig,
  ): Promise<AccountBalance> {
    return new AccountApi(config).getBalance(address, chainId, assetId)
  }

  private static generateAccount(
    chainId: ChainId,
    keyPair: ECKeyPair,
    password?: string,
    prefix?: string,
  ): Account {
    const account: Account = new Account()

    account.type = AddressType.Default
    account.chainId = chainId
    account.encrypted = false
    account.address = Address.from(
      chainId,
      account.type,
      keyPair.publicKey,
      prefix,
    ).address
    account.privateKey = keyPair.privateKey
    account.publicKey = keyPair.publicKey

    if (password) {
      account.encrypted = true
      account.privateKey = encryptAES(account.privateKey, password)
    }

    return account
  }

  public async getBalance(
    assetId: number = 1,
    config?: ApiServiceConfig,
  ): Promise<AccountBalance> {
    return Account.getBalance(this.address, this.chainId, assetId, config)
  }

  public toObject(): AccountInfo {
    let accountInfo: AccountInfo = {
      chainId: this.chainId,
      address: this.address,
      publicKey: this.publicKey.toString('hex'),
      privateKey: this.privateKey.toString('hex'),
    }

    if (this.encrypted) {
      accountInfo.encryptedPrivateKey = this.privateKey.toString().toLowerCase()
      delete accountInfo.privateKey
    }

    return accountInfo
  }
}

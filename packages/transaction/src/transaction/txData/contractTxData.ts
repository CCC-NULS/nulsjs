import {NulsSerializer, NulsParser} from '@nuls.io/core'

export type ContractArg = null | string[]
export type ContractArgs = ContractArg[]

export interface ContractTxDataObject {
  sender: string
  contractAddress: string
  gasLimit: number
  gasPrice: number
  args: ContractArgs
}

export class ContractTxData {
  public constructor(
    public _sender: string = '',
    public _contractAddress: string = '',
    public _gasLimit: number = 0,
    public _gasPrice: number = 0,
    public _args: ContractArgs = [],
  ) {}

  public senderFromBytes(parser: NulsParser): ContractTxData {
    this._sender = parser.readAddress()
    return this
  }

  public contractAddressFromBytes(parser: NulsParser): ContractTxData {
    this._contractAddress = parser.readAddress()
    return this
  }

  public gasLimitFromBytes(parser: NulsParser): ContractTxData {
    this._gasLimit = parser.readInt64LE().toNumber()
    return this
  }

  public gasPriceFromBytes(parser: NulsParser): ContractTxData {
    this._gasPrice = parser.readInt64LE().toNumber()
    return this
  }

  public argsFromBytes(parser: NulsParser): ContractTxData {
    const args: ContractArgs = []
    const l = parser.readUInt()

    if (l > 0) {
      for (let i = 0; i < l; i++) {
        let args2: ContractArg = null
        const l2 = parser.readUInt()

        if (l2 > 0) {
          args2 = []
          for (let j = 0; j < l2; j++) {
            const arg = parser.readString()
            args2.push(arg)
          }
        }

        args.push(args2)
      }
    }

    this._args = args

    return this
  }

  public toObject(): ContractTxDataObject {
    return {
      sender: this._sender,
      contractAddress: this._contractAddress,
      gasLimit: this._gasLimit,
      gasPrice: this._gasPrice,
      args: this._args,
    }
  }

  public senderToBytes(serial: NulsSerializer): this {
    serial.writeAddress(this._sender)
    return this
  }

  public contractAddressToBytes(serial: NulsSerializer): this {
    serial.writeAddress(this._contractAddress)
    return this
  }

  public gasLimitToBytes(serial: NulsSerializer): this {
    serial.writeInt64LE(this._gasLimit)
    return this
  }

  public gasPriceToBytes(serial: NulsSerializer): this {
    serial.writeInt64LE(this._gasPrice)
    return this
  }

  public argsToBytes(serial: NulsSerializer): this {
    const l = this._args.length

    if (l > 0) {
      serial.writeUInt(l)

      for (let i = 0; i < l; i++) {
        const args2: ContractArg = this._args[i]
        const l2 = args2 ? args2.length : 0

        if (l2 > 0) {
          serial.writeUInt(l2)

          for (let j = 0; j < l2; j++) {
            const arg = (args2 as string[])[j]
            serial.writeString(arg)
          }
        } else {
          serial.writeUInt(0)
        }
      }
    } else {
      serial.writeUInt(0)
    }

    return this
  }
}

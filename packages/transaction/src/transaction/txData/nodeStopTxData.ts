import {BaseTxData} from './baseTxData'
import {NulsSerializer, NulsParser} from '@nuls.io/core'

export interface NodeStopTxDataObject {
  agentHash: string
}

export class NodeStopTxData extends BaseTxData {
  public constructor(public _agentHash: string = '') {
    super()
  }

  public fromBytes(bytes: Buffer): NodeStopTxData {
    const parser = new NulsParser(bytes)
    this._agentHash = parser.readHash()
    return this
  }

  public toObject(): NodeStopTxDataObject {
    return {
      agentHash: this._agentHash,
    }
  }

  public toBytes(): Buffer {
    return new NulsSerializer().writeHash(this._agentHash).toBuffer()
  }
}

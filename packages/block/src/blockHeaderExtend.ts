import {NulsSerializer, NulsParser, BlockVersion} from '@nuls.io/core'

export interface BlockHeaderExtendObject {
  roundIndex: number
  consensusMemberCount: number
  roundStartTime: number
  packingIndexOfRound: number
  mainVersion: number
  blockVersion: number
  effectiveRatio: number
  continuousIntervalCount: number
  stateRoot: string
  seed: string
  nextSeedHash: string
}

export class BlockHeaderExtend {
  protected _roundIndex: number = -1
  protected _consensusMemberCount: number = -1
  protected _roundStartTime: number = -1
  protected _packingIndexOfRound: number = -1
  protected _mainVersion: number = -1
  protected _blockVersion: number = BlockVersion.NotDefined
  protected _effectiveRatio: number = -1
  protected _continuousIntervalCount: number = -1
  protected _stateRoot: Buffer = Buffer.from([])
  protected _seed: Buffer = Buffer.from([])
  protected _nextSeedHash: Buffer = Buffer.from([])

  public static fromBytes(bytes: Buffer | NulsParser): BlockHeaderExtend {
    const parser = bytes instanceof NulsParser ? bytes : new NulsParser(bytes)
    const extend = new BlockHeaderExtend()

    extend._roundIndex = parser.readUInt(4)
    extend._consensusMemberCount = parser.readUInt(2)
    extend._roundStartTime = parser.readUInt(4)
    extend._packingIndexOfRound = parser.readUInt(2)
    extend._mainVersion = parser.readUInt(2)
    extend._blockVersion = parser.readUInt(2)
    extend._effectiveRatio = parser.readUInt(1)
    extend._continuousIntervalCount = parser.readUInt(2)
    extend._stateRoot = parser.readBytesWithLength()

    if (parser.length() >= 40) {
      extend._seed = parser.read(32)
      extend._nextSeedHash = parser.read(8)
    }

    return extend
  }

  public toBytes(): Buffer {
    const serial = new NulsSerializer()
      .writeUInt(this._roundIndex, 4)
      .writeUInt(this._consensusMemberCount, 2)
      .writeUInt(this._roundStartTime, 4)
      .writeUInt(this._packingIndexOfRound, 2)
      .writeUInt(this._mainVersion, 2)
      .writeUInt(this._blockVersion, 2)
      .writeUInt(this._effectiveRatio, 1)
      .writeUInt(this._continuousIntervalCount, 2)
      .writeBytesWithLength(this._stateRoot)

    if (this._nextSeedHash) {
      serial.write(this._seed).write(this._nextSeedHash)
    }

    return serial.toBuffer()
  }

  public toObject(): BlockHeaderExtendObject {
    return {
      roundIndex: this._roundIndex,
      consensusMemberCount: this._consensusMemberCount,
      roundStartTime: this._roundStartTime,
      packingIndexOfRound: this._packingIndexOfRound,
      mainVersion: this._mainVersion,
      blockVersion: this._blockVersion,
      effectiveRatio: this._effectiveRatio,
      continuousIntervalCount: this._continuousIntervalCount,
      stateRoot: this._stateRoot.toString('hex'),
      seed: this._seed.toString('hex'),
      nextSeedHash: this._nextSeedHash.toString('hex'),
    }
  }

  public size(): number {
    const bytes = this.toBytes()
    return bytes.length
  }
}

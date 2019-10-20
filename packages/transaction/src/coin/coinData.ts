import {CoinInput, CoinOutput, CoinInputObject, CoinOutputObject} from './coin'
import {NulsSerializer, NulsParser} from '@nuls.io/core'

export interface CoinDataObject {
  inputs: CoinInputObject[]
  outputs: CoinOutputObject[]
}

export class CoinData {
  protected _inputs: CoinInput[] = []
  protected _outputs: CoinOutput[] = []

  public static fromBytes(buf: Buffer): CoinData {
    const parser = new NulsParser(buf)
    const coinData = new CoinData()

    const iLength = parser.readVarintNum()
    for (let i = 0; i < iLength; i++) {
      const input = CoinInput.fromBytes(parser)
      coinData._inputs.push(input)
    }

    const oLength = parser.readVarintNum()
    for (let i = 0; i < oLength; i++) {
      const output = CoinOutput.fromBytes(parser)
      coinData._outputs.push(output)
    }

    return coinData
  }

  public toBytes(): Buffer {
    const serial = new NulsSerializer()

    if (this._inputs.length === 0 && this._outputs.length === 0) {
      return serial.toBuffer()
    }

    serial.writeVarintNum(this._inputs.length)
    for (let i = 0; i < this._inputs.length; i++) {
      serial.write(this._inputs[i].toBytes())
    }

    // console.log("===> ", serial.toBuffer().toString('hex'))

    serial.writeVarintNum(this._outputs.length)
    for (let i = 0; i < this._outputs.length; i++) {
      serial.write(this._outputs[i].toBytes())
    }

    return serial.toBuffer()
  }

  public toObject(): CoinDataObject {
    return {
      inputs: this._inputs.map((input: CoinInput) => input.toObject()),
      outputs: this._outputs.map((output: CoinOutput) => output.toObject()),
    }
  }

  public addOutput(output: CoinOutput): number {
    this._outputs.push(output)
    return this._outputs.length - 1
  }

  public addInput(input: CoinInput): number {
    this._inputs.push(input)
    return this._inputs.length - 1
  }

  public getInputsValue(): number {
    return this._inputs.reduce(
      (prev: number, curr: CoinInput) => prev + curr._amount,
      0,
    )
  }

  public getOutputsValue(): number {
    return this._outputs.reduce(
      (prev: number, curr: CoinOutput) => prev + curr._amount,
      0,
    )
  }

  public getFee(): number {
    const inputs = this.getInputsValue()
    const outputs = this.getOutputsValue()

    return inputs - outputs
  }

  public inputs(inputs: CoinInput[]) {
    this._inputs = inputs
  }

  public outputs(outputs: CoinOutput[]) {
    this._outputs = outputs
  }

  public getInputs(): CoinInput[] {
    return this._inputs
  }

  public getOutputs(): CoinOutput[] {
    return this._outputs
  }

  public resetInputs(): CoinInput[] {
    this.inputs([])
    return this._inputs
  }

  public resetOutputs(): CoinOutput[] {
    this.outputs([])
    return this._outputs
  }

  public removeInput(index?: number): void
  public removeInput(item?: CoinInput): void
  public removeInput(arg: number | CoinInput | undefined): void {
    if (arg !== undefined) {
      let index: number =
        typeof arg !== 'number' ? this._inputs.indexOf(arg) : arg

      this._inputs.splice(index, 1)
    }
  }

  public removeOutput(index?: number): void
  public removeOutput(item?: CoinOutput): void
  public removeOutput(arg: number | CoinOutput | undefined): void {
    if (arg !== undefined) {
      let index: number =
        typeof arg !== 'number' ? this._outputs.indexOf(arg) : arg

      this._outputs.splice(index, 1)
    }
  }
}

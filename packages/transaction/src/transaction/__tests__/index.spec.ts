import 'jest'
import {Account} from '../account'
import {createECKeyPair, Address} from '@nuls.io/core'
import {TransferTransaction} from '../transferTransaction'

jest.mock('@nuls.io/core')

describe('nuls/transaction', () => {
  it('should parse a serialized transfer transaction', async () => {
    const txHex = '020034a9a35d03616161008c0117020001d2409a8ed9c2a260f0827333b7b3098677eb377c02000100a067f7050000000000000000000000000000000000000000000000000000000008c8ef7235b3c36e37000117020001d2409a8ed9c2a260f0827333b7b3098677eb377c0200010000e1f5050000000000000000000000000000000000000000000000000000000000000000000000006921026be795738c517254a724e0ee0b73631f1338628e6e78a678df2973f225161c83463044022003cb313ca28f35bb614ccdb227d4ab78ce945f34480c8f89ca99b5b3227f462102206de354ba27049967921e41d5ccb12777bc52f69ca2cbd7d81730926030da3fae'

    const buf = Buffer.from(txHex, 'hex')
    const tx = TransferTransaction.fromBytes(buf)

    const obj = await tx.toObject()
    expect(obj.hash).toBe('c7b3bd26d500ec1694f434a1607a0dc69e79375c20d72fe012d3ea55a63fe760')
    expect(obj.type).toBe(2)
    expect(obj.time).toBe(1571006772)
    expect(obj.remark).toBe('aaa')
    expect(obj.txData).toBe(null)

    const input = obj.coinData.inputs[0]

    expect(input.address).toBe('tNULSeBaMsvXgCBnaJ4u7rbQEKiWd23VWCudYm')
    expect(input.assetsChainId).toBe(2)
    expect(input.assetsId).toBe(1)
    expect(input.amount).toBe(100100000)
    expect(input.nonce).toBe('c8ef7235b3c36e37')
    expect(input.locked).toBe(0)

    const output = obj.coinData.outputs[0]

    expect(output.address).toBe('tNULSeBaMsvXgCBnaJ4u7rbQEKiWd23VWCudYm')
    expect(output.assetsChainId).toBe(2)
    expect(output.assetsId).toBe(1)
    expect(output.amount).toBe(100000000)
    expect(output.lockTime).toBe(0)

    expect(obj.signature).toBe('21026be795738c517254a724e0ee0b73631f1338628e6e78a678df2973f225161c83463044022003cb313ca28f35bb614ccdb227d4ab78ce945f34480c8f89ca99b5b3227f462102206de354ba27049967921e41d5ccb12777bc52f69ca2cbd7d81730926030da3fae')
  })
})

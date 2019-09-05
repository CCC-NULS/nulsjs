import 'jest'
import {Address, AddressType} from '../address'
import {ChainId} from '../common'

describe('nuls/core/address', () => {
  const publicKey = Buffer.from(
    'ea99cd42ff532f4bf845c789c0d304a69b2c29ffbddfba07da7f26e98bcba904',
    'hex',
  )
  const expectedAddress = 'NULSd6HgW7ZnWHfRGbNi2XYuNnrWbg8wqtzkd'

  it('Address.from() should generate a public address form a public key and some parameters', () => {
    const address = Address.from(
      ChainId.Mainnet,
      AddressType.Default,
      publicKey,
    )
    expect(address.address).toBe(expectedAddress)
  })
})

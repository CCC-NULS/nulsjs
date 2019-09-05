import 'jest'
import {Account} from '../account'
import {createECKeyPair, Address} from '@nuls/core'

jest.mock('@nuls/core')

describe('nuls/account/index', () => {
  it('should create a new account with default parameters', () => {
    ;(createECKeyPair as jest.Mock).mockImplementation(() => {
      return {
        publicKey: Buffer.from(
          'ea99cd42ff532f4bf845c789c0d304a69b2c29ffbddfba07da7f26e98bcba904',
          'hex',
        ),
        privateKey: Buffer.from(
          '02f26003a899dcf73432b6c1d8171b6b9dc8f5ea6d879f649c9f607b2fa4b6b7b2',
          'hex',
        ),
      }
    })
    ;(Address.from as jest.Mock).mockImplementation(() => {
      return {
        address: 'MOCK_ADDRESS',
      }
    })

    const account = Account.create()
    expect(account.toObject()).toBeDefined()
  })
})

export const createECKeyPair = jest.fn()
export const Address = {
  from: jest.fn(),
}
export const encryptAES = jest.fn()

export const {ChainId, AddressType} = jest.requireActual('@nuls/core')

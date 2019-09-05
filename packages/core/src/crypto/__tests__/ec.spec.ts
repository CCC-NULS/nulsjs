import 'jest'
import {createECKeyPair, validateKeyPair} from '../ec'

describe('nuls/core/crypto/ec', () => {
  it('should create a valid EC key pairs', () => {
    const keyPair = createECKeyPair()
    const valid = validateKeyPair(keyPair)
    expect(valid).toBeTruthy()
  })
})

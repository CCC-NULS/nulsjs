import 'jest'
import {encryptAES, decryptAES} from '../aes'

describe('nuls/core/crypto/aes', () => {
  const message = 'HELLO WORLD!'
  const messageBuff = Buffer.from(message, 'utf8')
  const encryptedMessage = Buffer.from('VU8f8AzSFSPWZvCxOcbVPw==', 'base64')
  const password = '123456*'

  it('should encrypt a message with a given password', () => {
    const encrypted = encryptAES(messageBuff, password)
    expect(encrypted).toEqual(encryptedMessage)
  })

  it('should decrypt a message with a given password', () => {
    const decrypted = decryptAES(encryptedMessage, password)
    expect(decrypted).toEqual(messageBuff)
  })
})

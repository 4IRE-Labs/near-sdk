import * as near from '.'
import * as api from 'near-api-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(path.dirname(__dirname), 'test.env') })

const entropy = Buffer.from('0123456789ABCDEF')
const expectMnemonic = 'coral maze mimic half fat breeze thought choice drastic boss bacon middle'
const expectAccount = <near.AccountNetwork>{
  networkId: 'local',
  accountId: '47d322f48bf873ad10c1b6ed2253518d3d3e0cad9a1a72a9c62b311400b72c7a',
  keyPair: api.KeyPair.fromString('3dcxBUp8tZRqiEQkt7MJU3ipW8VkBGKjhhCUwERq9J5qiyYJ6BWiinVY7xVNmks5jLmz9NT1d75CPGy4j6SfxAFs')
}

test('credentialsPath', async () => {
  expect(near.credentialsPath()).toContain('/.near')
})

test('parseAccountNetwork', async () => {
  const actual = near.parseAccountNetwork()
  expect(actual.accountId).toBe('local')
  expect(actual.keyPair.publicKey.toString()).toBe('ed25519:7PGseFbWxvYVgZ89K1uTJKYoKetWs7BJtbyXDzfbAcqX')
})

test('generateMnemonic', async () => {
  expect(near.generateMnemonic(entropy)).toStrictEqual(expectMnemonic)
})

test('generateAccountByEntropy', async () => {
  expect(near.generateAccountByEntropy(entropy)).toStrictEqual(expectAccount)
})

test('unencryptedFileSystemKeyStore', async () => {
  await near.writeUnencryptedFileSystemKeyStore(near.generateAccountByEntropy(entropy))
  expect(await near.readUnencryptedFileSystemKeyStore(expectAccount.accountId)).toStrictEqual(expectAccount)
})

test('createAccount', async () => {
  const bob = near.generateAccount(`bob${+ new Date}`)
  expect(await near.isExistAccount(bob)).toBe(false)
  const trx = await near.createAccount(near.parseAccountNetwork(), bob)
  expect(trx.value).toBe(true)
  expect(await near.isExistAccount(bob)).toBe(true)
})

test('createAccount fail by deposit', async () => {
  try {
    await near.createCustodianAccount(`${+ new Date}`, '')
    expect(true).toBe(false)
  } catch (e) {
    expect(e.message).toBe('Error: wrong amount')
  }
})

test('createCustodianAccount', async () => {
  const trx = await near.createCustodianAccount(`${+ new Date}`)
  expect(trx.value).toBe(true)
})

test('mnemonicToAccount', async () => {
  const actual = await near.mnemonicToAccount(expectMnemonic, 'sample')
  expect(actual.accountId).toBe('sample.local')
})

test('isExistAccount', async () => {
  const sample = await near.mnemonicToAccount(expectMnemonic, 'sample')
  expect(await near.isExistAccount(sample)).toBe(false)
})

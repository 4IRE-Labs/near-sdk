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

test('credentialsPath default', async () => {
  const prev = process.env.NEAR_CREDENTIALS_PATH
  process.env.NEAR_CREDENTIALS_PATH = ''
  expect(near.credentialsPath()).toContain('/.near-credentials')
  process.env.NEAR_CREDENTIALS_PATH = prev
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
  jest.setTimeout(10000)
  const bob = near.generateAccount(`bob${+ new Date}`)
  expect(await near.isExistAccount(bob)).toBe(false)
  const trx = await near.createAccount(near.parseAccountNetwork(), bob)
  expect(trx.value).toBe(true)
  expect(await near.isExistAccount(bob)).toBe(true)
})

test('deleteAccount', async () => {
  jest.setTimeout(10000)
  const bob = near.generateAccount(`bob${+ new Date}`)
  expect(await near.isExistAccount(bob)).toBe(false)
  await near.createAccount(near.parseAccountNetwork(), bob)
  expect(await near.isExistAccount(bob)).toBe(true)
  const trx = await near.deleteAccount(bob)
  expect(trx.value).toBe('')
  expect(await near.isExistAccount(bob)).toBe(false)
})

test('createAccount fail by deposit', async () => {
  try {
    await near.createCustodianAccount(`${+ new Date}`, '')
    expect(true).toBe(false)
  } catch (e) {
    expect(e.message).toBe('Error: wrong amount')
  }
})

test('createCustodianAccountBySlug', async () => {
  const slug = `${+ new Date}`
  const trx = await near.createCustodianAccountBySlug(slug)
  expect(trx.value).toBe(true)
  const account =near.custodianAccountBySlug(slug)
  expect(await near.isExistAccount(account)).toBe(true)
  expect(account.accountId).toBe(`${slug}.local`)
})

test('createCustodianAccount', async () => {
  const slug = `${+ new Date}`
  const trx = await near.createCustodianAccount(slug)
  expect(trx.value).toBe(true)
})

test('mnemonicToAccount', async () => {
  const actual = await near.mnemonicToAccount(expectMnemonic, 'sample')
  expect(actual.accountId).toBe('sample')
})

test('isExistAccount', async () => {
  const sample = await near.mnemonicToAccount(expectMnemonic, 'sample')
  expect(await near.isExistAccount(sample)).toBe(false)
})

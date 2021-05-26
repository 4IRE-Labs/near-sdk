import {
  account,
} from '.'
import {KeyPair} from 'near-api-js'

import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(path.dirname(__dirname), 'test.env') })

const expectAccount = <account.AccountNetwork>{
  networkId: 'local',
  accountId: '47d322f48bf873ad10c1b6ed2253518d3d3e0cad9a1a72a9c62b311400b72c7a',
  keyPair: KeyPair.fromString('3dcxBUp8tZRqiEQkt7MJU3ipW8VkBGKjhhCUwERq9J5qiyYJ6BWiinVY7xVNmks5jLmz9NT1d75CPGy4j6SfxAFs')
}

test('credentialsPath', async () => {
  expect(account.credentialsPath()).toContain('/local')
})

test('parseAccountNetwork', async () => {
  const actual = account.parseAccountNetwork()
  expect(actual.accountId).toBe('local')
  expect(actual.keyPair.publicKey.toString()).toBe('ed25519:7PGseFbWxvYVgZ89K1uTJKYoKetWs7BJtbyXDzfbAcqX')
})

test('generateMnemonic', async () => {
  expect(account.generateMnemonic(Buffer.from('0123456789ABCDEF'))).toStrictEqual('coral maze mimic half fat breeze thought choice drastic boss bacon middle')
})

test('generateAccount', async () => {
  expect(account.generateAccount(Buffer.from('0123456789ABCDEF'))).toStrictEqual(expectAccount)
})

test('unencryptedFileSystemKeyStore', async () => {
  await account.writeUnencryptedFileSystemKeyStore(account.generateAccount(Buffer.from('0123456789ABCDEF')))
  expect(await account.readUnencryptedFileSystemKeyStore(expectAccount.accountId)).toStrictEqual(expectAccount)
})

test('createAccount', async () => {
  expectAccount.accountId = `${+ new Date}.local`
  const trx = await account.createAccount(account.parseAccountNetwork(), expectAccount)
  expect(trx.value).toBeTruthy()
})

test('createCustodianAccount', async () => {
  const trx = await account.createCustodianAccount(`${+ new Date}.local`)
  expect(trx.value).toBeTruthy()
})

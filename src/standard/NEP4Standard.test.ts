import {
  accountIdBySlug,
  custodianAccount,
  NEP4Standard,
  Contract,
} from '../'
import {
  config
} from '../../util'
config()

function newConnectContract(accountId: string) {
  const sender = custodianAccount(accountId)
  return Contract.connect(NEP4Standard, accountIdBySlug('nep4'), sender)
}

const aliceId = accountIdBySlug('alice')
const bobId = accountIdBySlug('bob')

test('access', async () => {
  const aliceContract = await newConnectContract(aliceId)
  const bobContract = await newConnectContract(bobId)
  expect(await bobContract.checkAccess(aliceId)).toEqual(false)
  await aliceContract.grantAccess(bobId)
  expect(await bobContract.checkAccess(aliceId)).toEqual(true)
  await aliceContract.revokeAccess(bobId)
  expect(await bobContract.checkAccess(aliceId)).toEqual(false)
})

test('transfer', async () => {
  const aliceContract = await newConnectContract(aliceId)
  const bobContract = await newConnectContract(bobId)
  await aliceContract.transfer(bobId, 0)
  expect(await aliceContract.getTokenOwner(0)).toEqual(bobId)
  await bobContract.transfer(aliceId, 0)
  expect(await aliceContract.getTokenOwner(0)).toEqual(aliceId)
})

test('transferFrom', async () => {
  const aliceContract = await newConnectContract(aliceId)
  const bobContract = await newConnectContract(bobId)
  await aliceContract.transferFrom(aliceId, bobId, 0)
  expect(await aliceContract.getTokenOwner(0)).toEqual(bobId)
  await bobContract.transferFrom(bobId, aliceId, 0)
  expect(await aliceContract.getTokenOwner(0)).toEqual(aliceId)
})

test('getTokenOwner', async () => {
  const aliceContract = await newConnectContract(aliceId)
  expect(await aliceContract.getTokenOwner(0)).toEqual(aliceId)
})

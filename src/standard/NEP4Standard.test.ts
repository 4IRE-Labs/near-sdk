import * as near from '../'
import * as util from '../../util'
util.config()

function newConnectContract(accountId: string) {
  const sender = near.custodianAccount(accountId)
  return near.Contract.connect(near.NEP4Standard, near.accountIdBySlug('nep4'), sender)
}

const aliceId = near.accountIdBySlug('alice')
const bobId = near.accountIdBySlug('bob')

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

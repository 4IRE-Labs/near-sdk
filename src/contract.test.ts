import * as near from '.'
import * as util from '../util'
import {toNear} from '.'
util.config()

test('deploy without init', async () => {
  const code = await near.fetchContract('near', 'mainnet')
  expect(code).toBeTruthy()
  const accountId = `contract${+ new Date}`
  const sender = near.parseAccountNetwork('local')
  const contract = near.generateAccount(accountId)
  const result = await near.deployContract(contract, code, {
    sender,
    amount: '10',
  })
  expect(result.account.accountId).toEqual(accountId)
  expect(result.outcome.value).toEqual('')
})

test('deploy and init', async () => {
  const code = await near.fetchContract('contract.paras.near', 'mainnet')
  expect(code).toBeTruthy()
  const accountId = `contract${+ new Date}`
  const sender = near.parseAccountNetwork('local')
  const contract = near.generateAccount(accountId)
  const props = {
    sender,
    amount: '10',
    init: {
      methodName: 'init',
      args: {
        initialOwner: 'local',
      },
    }
  }
  let result = await near.deployContract<boolean>(contract, code, props)
  let state = await result.account.state()
  expect(toNear(state.amount)).toBeGreaterThanOrEqual(10)
  expect(result.account.accountId).toEqual(accountId)
  expect(result.outcome.value).toEqual(true)
  // redeploy
  props.sender = contract
  delete props.init
  result = await near.deployContract<boolean>(contract, code, props)
  state = await result.account.state()
  expect(toNear(state.amount)).toBeGreaterThanOrEqual(9)
  expect(result.outcome.value).toEqual('')
})

test('deploy enough balance to cover storage', async () => {
  const code = await near.fetchContract('contract.paras.near', 'mainnet')
  expect(code).toBeTruthy()
  const accountId = `contract${+ new Date}`
  const contract = near.generateAccount(accountId)
  try {
    await near.deployContract<boolean>(contract, code)
    expect(true).toBe(false)
  } catch (e) {
    expect(e.message).toContain('wouldn\'t have enough balance to cover storage, required to have 384530000000000000000000 yoctoNEAR more')
  }
})

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

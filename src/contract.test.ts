import * as near from '.'
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(path.dirname(__dirname), 'test.env') })

test('createAndDeployContract', async () => {
  jest.setTimeout(10000)
  const code = await near.fetchContract('near', 'mainnet')
  expect(code).toBeTruthy()
  const contract = near.generateAccount(`contract${+ new Date}`)
  const contractAccount = await near.createAndDeployContract(contract, code, '100')
  expect(contractAccount).toBeTruthy()
})

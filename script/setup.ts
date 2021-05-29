import * as near from '../src/'
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({path: path.join(path.dirname(__dirname), 'test.env')})

async function main() {
    const code = await near.fetchContract('near', 'mainnet')
    const sender = near.parseAccountNetwork('node0')
    const contract = near.custodianAccount('local')
    await near.createAndDeployContract(contract, code, '1000000', sender)
}
main().catch(console.error)

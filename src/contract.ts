import * as api from 'near-api-js'
import * as account from './account'
import * as config from './config'
import * as util from './util'
import * as provider from 'near-api-js/lib/providers/provider'

export async function fetchContract(accountId: string, networkId?: string): Promise<Uint8Array> {
    const rpc = new api.providers.JsonRpcProvider(config.environment(networkId).nodeUrl)
    const result = await rpc.query<provider.ContractCodeView>({
        request_type: 'view_code',
        finality: 'final',
        account_id: accountId
    })
    return Buffer.from(result.code_base64, 'base64')
}

export async function createAndDeployContract(
    contract: account.AccountNetwork,
    code: Uint8Array,
    amount: string,
    sender?: account.AccountNetwork,
    ):Promise<api.Account> {
    sender = sender || account.parseAccountNetwork()
    const deposit = util.deposit(amount)
    const senderAccount = await account.accountConnect(sender)
    return await senderAccount.createAndDeployContract(
        contract.accountId,
        contract.keyPair.publicKey,
        code,
        deposit)
}

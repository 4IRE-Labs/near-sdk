import * as near from '../src'
import * as util from '.'
util.config()

async function main() {
    console.log('[SETUP] IN PROGRESS')
    let code = await near.fetchContract('near', 'mainnet')
    let sender = near.parseAccountNetwork('node0')
    let account = near.custodianAccount('local')
    let result = await near.deployContract(account, code, {amount: '1000000', sender})
    console.log('[SETUP] Created helper account:', {
        accountId: result.account.accountId,
        transactionId: result.outcome.transactionId,
    })
    sender = near.parseAccountNetwork('local')

    account = near.custodianAccount(near.accountIdBySlug('4irelabs'), sender)
    let trx = await near.createAccount(sender, account, '100')
    console.log('[SETUP] Created account:', {
        accountId: account.accountId,
        transactionId: trx.transactionId,
    })
    account = near.custodianAccount(near.accountIdBySlug('alice'), sender)
    trx = await near.createAccount(sender, account, '100')
    console.log('[SETUP] Created account:', {
        accountId: account.accountId,
        transactionId: trx.transactionId,
    })
    account = near.custodianAccount(near.accountIdBySlug('bob'), sender)
    trx = await near.createAccount(sender, account, '100')
    console.log('[SETUP] Created account:', {
        accountId: account.accountId,
        transactionId: trx.transactionId,
    })

    code = await near.fetchContract('nep4.4irelabs.testnet', 'testnet')
    account = near.custodianAccount(near.accountIdBySlug('nep4'))
    result = await near.deployContract(account, code, {
        amount: '100',
        sender,
        init: {
            methodName: 'new',
            args: {
                owner_id: account.accountId,
            },
        }
    })
    console.log('[SETUP] Created NEP4 account:', {
        accountId: result.account.accountId,
        transactionId: result.outcome.transactionId,
    })
    await result.account.functionCall({
        contractId: result.account.accountId,
        methodName: 'mint_token',
        args: {owner_id: near.accountIdBySlug('alice'), token_id: 0},
    })
    console.log('[SETUP] DONE')
}

main().catch(console.error)

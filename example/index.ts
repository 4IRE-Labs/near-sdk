import * as dotenv from 'dotenv'
dotenv.config()

import {
    account as near,
} from '@4ire-labs/near-sdk'

async function main() {
    // Getting Sender Account
    const sender = near.parseAccountNetwork()
    console.log('Sender Account:', {
        accountId: sender.accountId,
        publicKey: sender.keyPair.publicKey.toString(),
    })
    let result: near.CreateAccountResult
    let newAccount: near.AccountNetwork

    // Custodial Account
    newAccount = near.custodianAccount(`1622055456449.near`, sender)
    console.log('Custodial Account:', {
        accountId: newAccount.accountId,
        publicKey: newAccount.keyPair.publicKey.toString(),
    })
    await near.writeUnencryptedFileSystemKeyStore(newAccount)
    result = await near.createAccount(sender, newAccount)
    console.log(result.outcome.transaction.hash)
    console.log(result.value)
}

main().catch(console.error)

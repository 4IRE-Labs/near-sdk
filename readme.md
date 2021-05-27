<div align="center">
  <h1><code>@4ire-labs/near-sdk</code></h1>
  <p>
    <strong>SDK for NEAR Protocol</strong>
  </p>
</div>

[![Coverage Status](https://coveralls.io/repos/github/4IRE-Labs/near-sdk/badge.svg?branch=main)](https://coveralls.io/github/4IRE-Labs/near-sdk?branch=main)

# Install

```shell
npm install @4ire-labs/near-sdk
```

# Use

```dotenv
NEAR_ENV=testnet
NEAR_SENDER_ID=name.testnet
NEAR_SENDER_PRIVATE_KEY=ed25519:data
```

```typescript
import * as dotenv from 'dotenv'
dotenv.config()

import {
    account as near,
} from '@4ire-labs/near-sdk'

async function main() {
    const entropy = Buffer.from('0123456789ABCDEF')
    const mnemonic = near.generateMnemonic(entropy)
    console.log('mnemonic:', mnemonic)

    // Implicit Account https://docs.near.org/docs/roles/integrator/implicit-accounts
    const newImplicitAccount = near.mnemonicToAccount(mnemonic)
    console.log('Implicit Account:', {
        accountId: newImplicitAccount.accountId,
        publicKey: newImplicitAccount.keyPair.publicKey.toString(),
    })
    await near.writeUnencryptedFileSystemKeyStore(newImplicitAccount)

    // Getting Sender Account
    const sender = near.parseAccountNetwork()
    console.log('Sender Account:', {
        accountId: sender.accountId,
        publicKey: sender.keyPair.publicKey.toString(),
    })
    let result: near.CreateAccountResult
    let newAccount: near.AccountNetwork

    // Normal Account
    newAccount = near.mnemonicToAccount(mnemonic, `${+new Date}.testnet`)
    console.log('Normal Account:', {
        accountId: newAccount.accountId,
        publicKey: newAccount.keyPair.publicKey.toString(),
    })
    await near.writeUnencryptedFileSystemKeyStore(newAccount)
    result = await near.createAccount(sender, newAccount)
    console.log(result.outcome.transaction.hash)
    console.log(result.value)

    // Custodial Account
    newAccount = near.custodianAccount(`${+new Date}.testnet`, sender)
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
```

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

TL;DR run [example](https://github.com/4IRE-Labs/near-sdk/tree/main/example)

```dotenv
NEAR_ENV=testnet
NEAR_SENDER_ID=name.testnet
NEAR_SENDER_PRIVATE_KEY=ed25519:data
```

```typescript
import * as near from '@4ire-labs/near-sdk'
import 'dotenv/config'
```

## NFT

```typescript
class NFTBasic extends near.NEP4Standard {
    mintToken(owner_id: string, token_id: number): Promise<near.Outcome<void>> {
        return this.callRaw({
            methodName: 'mint_token',
            args: {owner_id, token_id},
        })
    }
}

async function token() {
    const ownerContract = near.custodianAccount(near.accountIdBySlug('nep4'))
    const NFTContract = await near.Contract.connect(
        NFTBasic,
        near.accountIdBySlug('nep4'),
        ownerContract,
    )
    const tokenId = +new Date
    const mintTrx = await NFTContract.mintToken(ownerContract.accountId, tokenId)
    console.log(`Minted NFT #${tokenId}:`, {
        accountId: await NFTContract.getTokenOwner(tokenId),
        transactionId: mintTrx.transactionId,
    })
}
```
```shell
Minted NFT #1622990248520: {
  accountId: 'nep4.local',
  transactionId: 'nep4.local:5d5o65nfmWWdbXXwtfM9mdqyR6E7X2VEPt586JeSHQK4'
}
```

## Account

```typescript
async function account() {
    const deposit = '0.05'
    const entropy = Buffer.from('0123456789ABCDEF')
    const mnemonic = near.generateMnemonic(entropy)
    console.log('mnemonic:', mnemonic)

    // Implicit Account
    // https://docs.near.org/docs/roles/integrator/implicit-accounts
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
    let trx: near.Outcome<boolean>
    let newAccount: near.AccountNetwork

    // Normal Account
    newAccount = near.mnemonicToAccount(mnemonic, near.accountIdBySlug(`sample${+new Date}`))
    await near.writeUnencryptedFileSystemKeyStore(newAccount)
    trx = await near.createAccount(sender, newAccount, deposit)
    console.log('Created normal account:', {
        accountId: newAccount.accountId,
        publicKey: newAccount.keyPair.publicKey.toString(),
        transactionId: trx.transactionId,
    })
    trx = await near.deleteAccount(newAccount)
    console.log('Deleted transactionId:', trx.transactionId)

    // Custodial Account
    newAccount = near.custodianAccount(near.accountIdBySlug(`sample${+new Date}`), sender)
    trx = await near.createAccount(sender, newAccount, deposit)
    await near.writeUnencryptedFileSystemKeyStore(newAccount)
    console.log('Created custodial account:', {
        accountId: newAccount.accountId,
        publicKey: newAccount.keyPair.publicKey.toString(),
        transactionId: trx.transactionId,
    })
    trx = await near.deleteAccount(newAccount)
    console.log('Deleted transactionId:', trx.transactionId)
}
```

```shell
mnemonic: coral maze mimic half fat breeze thought choice drastic boss bacon middle
Implicit Account: {
  accountId: '47d322f48bf873ad10c1b6ed2253518d3d3e0cad9a1a72a9c62b311400b72c7a',
  publicKey: 'ed25519:5qNgFf7z5huxn11jgPJBnX2RGdmcmYodhLWnd71oozgH'
}
Sender Account: {
  accountId: 'local',
  publicKey: 'ed25519:7PGseFbWxvYVgZ89K1uTJKYoKetWs7BJtbyXDzfbAcqX'
}
Created normal account: {
  accountId: 'sample1622990251089.local',
  publicKey: 'ed25519:5qNgFf7z5huxn11jgPJBnX2RGdmcmYodhLWnd71oozgH',
  transactionId: 'local:EpGPDCgKUbdGZQsx517bMSfiYSbCEqa49xrw1J6Voobk'
}
Deleted transactionId: sample1622990251089.local:CLnDXM7JAZqiWLWdthdrAB6SdBNmW9S9SFZvPKP8JmNn
Created custodial account: {
  accountId: 'sample1622990256631.local',
  publicKey: 'ed25519:7PGseFbWxvYVgZ89K1uTJKYoKetWs7BJtbyXDzfbAcqX',
  transactionId: 'local:2TCrKv62VeViFdnQB9AknYpVXRuxVp4zA8rccAgNmctq'
}
Deleted transactionId: sample1622990256631.local:3gwSA1hEiZ3rWja3tPifZPbWhr7ok39FTfaNg4VrqNbP
```

## [🧙‍♂ Docs for develop 🧝‍♀️](https://github.com/4IRE-Labs/near-sdk/blob/main/docs/readme.md#develop-docs)

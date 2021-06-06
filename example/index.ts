import * as near from '@4ire-labs/near-sdk'
import 'dotenv/config'

class NFTBasic extends near.NEP4Standard {
    mintToken(owner_id: string, token_id: number): Promise<near.Outcome<void>> {
        return this.callRaw({
            methodName: 'mint_token',
            args: {owner_id, token_id},
        })
    }
}

async function token() {
    // NFT Basic
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

async function main() {
    await token()
    await account()
}

main().catch(console.error)


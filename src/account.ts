import * as seed from 'near-seed-phrase'
import * as api from 'near-api-js'
import * as path from 'path'
import * as os from 'os'
import BN from 'bn.js'
import * as connect from './connect'
import * as config from './config'
import * as transaction from './transaction'
import * as provider from 'near-api-js/lib/providers/provider'
import * as util from './util'

const CREDENTIALS_DIR = '.near-credentials'

export interface AccountNetwork {
    networkId: string
    accountId: string
    keyPair: api.utils.KeyPairEd25519
}

export async function deleteAccount(pruneAccount: AccountNetwork, beneficiary?: AccountNetwork): Promise<transaction.Outcome<boolean>> {
    beneficiary = beneficiary || parseAccountNetwork()
    const account = await accountConnect(pruneAccount)
    return account.deleteAccount(beneficiary.accountId)
        .then(outcome => transaction.transactionOutcome(outcome))
}

export async function accountConnect(account: AccountNetwork): Promise<api.Account> {
    const near = await connect.newConnect(account)
    return near.account(account.accountId)
}

export async function stateAccount(accountNetwork: AccountNetwork): Promise<provider.AccountView> {
    const account = await accountConnect(accountNetwork)
    return account.state()
}

export async function isExistAccount(accountNetwork: AccountNetwork): Promise<boolean> {
    return stateAccount(accountNetwork).then(() => true).catch(() => false)
}

export function custodianAccount(accountId: string, custodian?: AccountNetwork): AccountNetwork {
    custodian = custodian || parseAccountNetwork()
    const environment = config.environment(custodian.networkId)
    const part = accountId.split('.')
    if (part[part.length-1] !== environment.helperAccount) {
        accountId = `${accountId}.${environment.helperAccount}`
    }
    return <AccountNetwork>{
        accountId: accountId,
        networkId: custodian.networkId,
        keyPair: custodian.keyPair,
    }
}

export async function createCustodianAccount(accountId: string, amount = '0.05', custodian?: AccountNetwork): Promise<transaction.Outcome<boolean>> {
    custodian = custodian || parseAccountNetwork()
    const newAccount = custodianAccount(accountId, custodian)
    return createAccount(custodian, newAccount, amount)
}

export async function createAccount(creator: AccountNetwork, newAccount: AccountNetwork, amount = '0.05'): Promise<transaction.Outcome<boolean>> {
    const near = await connect.newConnect(creator)
    const creatorAccount = await near.account(creator.accountId)
    const config = <config.Environment>near.config
    const publicKey = newAccount.keyPair.publicKey.toString()
    return creatorAccount.functionCall({
        contractId: config.helperAccount,
        methodName: 'create_account',
        args: {
            new_account_id: newAccount.accountId,
            new_public_key: publicKey,
        },
        gas: new BN('300000000000000'),
        attachedDeposit: util.deposit(amount),
    }).then(outcome => transaction.transactionOutcome(outcome))
}

export function credentialsPath(): string {
    return path.resolve(process.env.NEAR_CREDENTIALS_PATH || path.join(os.homedir(), CREDENTIALS_DIR))
}

export function parseAccountNetwork(accountId?: string, encodedKey?: string, networkId?: string): AccountNetwork {
    const account = <AccountNetwork>{}
    account.networkId = connect.parseNetworkId(networkId)
    account.accountId = connect.parseAccountId(accountId)
    account.keyPair = <api.utils.KeyPairEd25519>api.KeyPair.fromString(connect.parsePrivateKey(encodedKey))
    return account
}

export async function readUnencryptedFileSystemKeyStore(accountId: string, networkId?: string): Promise<AccountNetwork> {
    const account = <AccountNetwork>{
        accountId
    }
    const keyStore = new api.keyStores.UnencryptedFileSystemKeyStore(credentialsPath())
    account.networkId = connect.parseNetworkId(networkId)
    account.keyPair = <api.utils.KeyPairEd25519>await keyStore.getKey(account.networkId, account.accountId)
    return account
}

export async function writeUnencryptedFileSystemKeyStore(account: AccountNetwork): Promise<void> {
    const keyStore = new api.keyStores.UnencryptedFileSystemKeyStore(credentialsPath())
    return keyStore.setKey(account.networkId, account.accountId, account.keyPair)
}

export function generateMnemonic(entropy?: Buffer): string {
    return seed.generateSeedPhrase(entropy).seedPhrase
}

export function generateAccountByEntropy(entropy?: Buffer, accountId?: string, networkId?: string): AccountNetwork {
    return mnemonicToAccount(generateMnemonic(entropy), accountId, networkId)
}

export function generateAccount(accountId?: string, networkId?: string): AccountNetwork {
    return mnemonicToAccount(generateMnemonic(), accountId, networkId)
}

export function mnemonicToAccount(phrase: string, accountId?: string, networkId?: string): AccountNetwork {
    const mnemonic = seed.parseSeedPhrase(phrase)
    const account = <AccountNetwork>{}
    account.networkId = connect.parseNetworkId(networkId)
    if (accountId) {
        const environment = config.environment(account.networkId)
        account.accountId = `${accountId}.${environment.helperAccount}`
    } else {
        account.accountId = Buffer.from(api.utils.PublicKey.fromString(mnemonic.publicKey).data).toString('hex')
    }
    account.keyPair = <api.utils.KeyPairEd25519>api.KeyPair.fromString(mnemonic.secretKey)
    return account
}


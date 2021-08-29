import {
    generateSeedPhrase,
    parseSeedPhrase,
} from 'near-seed-phrase'
import {
    KeyPair as NearKeyPair,
} from 'near-api-js'
import {
    Account as NearAccount,
} from 'near-api-js'
import BN from 'bn.js'
import {
    PublicKey,
    KeyPairEd25519,
} from 'near-api-js/lib/utils'
import {
    AccountView,
} from 'near-api-js/lib/providers/provider'
import {
    newConnect,
    parseNetworkId,
    parseAccountId,
    parsePrivateKey,
} from './connect'
import {
    Environment,
    environment,
} from './config'
import {
    toYocto,
} from './util'
import {
    Outcome,
    transactionOutcome,
} from './transaction'

export interface KeyPair extends NearKeyPair {
    readonly publicKey: PublicKey
    readonly secretKey: string
}

export interface AccountNetwork {
    networkId: string
    accountId: string
    keyPair: KeyPair
}

export async function deleteAccount(pruneAccount: AccountNetwork, beneficiary?: AccountNetwork): Promise<Outcome<boolean>> {
    beneficiary = beneficiary || parseAccountNetwork()
    const account = await accountConnect(pruneAccount)
    return account.deleteAccount(beneficiary.accountId)
        .then(outcome => transactionOutcome(outcome))
}

export async function accountConnect(account: AccountNetwork): Promise<NearAccount> {
    const near = await newConnect(account)
    return near.account(account.accountId)
}

export async function stateAccount(accountNetwork: AccountNetwork): Promise<AccountView> {
    const account = await accountConnect(accountNetwork)
    return account.state()
}

export async function isExistAccount(accountNetwork: AccountNetwork): Promise<boolean> {
    return stateAccount(accountNetwork).then(() => true).catch(() => false)
}

export function accountIdBySlug(slug: string, networkId?: string): string {
    return `${slug}.${environment(networkId).helperAccount}`
}

export function custodianAccountBySlug(slug: string, custodian?: AccountNetwork): AccountNetwork {
    return custodianAccount(accountIdBySlug(slug), custodian)
}

export function custodianAccount(accountId: string, custodian?: AccountNetwork): AccountNetwork {
    custodian = custodian || parseAccountNetwork()
    return <AccountNetwork>{
        accountId: accountId,
        networkId: custodian.networkId,
        keyPair: custodian.keyPair,
    }
}

export async function createCustodianAccountBySlug(slug: string, amount = '0.05', custodian?: AccountNetwork): Promise<Outcome<boolean>> {
    return createCustodianAccount(accountIdBySlug(slug), amount, custodian)
}

export async function createCustodianAccount(accountId: string, amount = '0.05', custodian?: AccountNetwork): Promise<Outcome<boolean>> {
    custodian = custodian || parseAccountNetwork()
    const newAccount = custodianAccount(accountId, custodian)
    return createAccount(custodian, newAccount, amount)
}

export async function createAccount(creator: AccountNetwork, newAccount: AccountNetwork, amount = '0.05'): Promise<Outcome<boolean>> {
    const near = await newConnect(creator)
    const creatorAccount = await near.account(creator.accountId)
    const config = <Environment>near.config
    const publicKey = newAccount.keyPair.publicKey.toString()
    return creatorAccount.functionCall({
        contractId: config.helperAccount,
        methodName: 'create_account',
        args: {
            new_account_id: newAccount.accountId,
            new_public_key: publicKey,
        },
        gas: new BN('300000000000000'),
        attachedDeposit: toYocto(amount),
    }).then(outcome => transactionOutcome(outcome))
}

export function parseAccountNetwork(accountId?: string, encodedKey?: string, networkId?: string): AccountNetwork {
    const account = <AccountNetwork>{}
    account.networkId = parseNetworkId(networkId)
    account.accountId = parseAccountId(accountId)
    account.keyPair = <KeyPairEd25519>NearKeyPair.fromString(parsePrivateKey(encodedKey))
    return account
}

export function generateMnemonic(entropy?: Buffer): string {
    return generateSeedPhrase(entropy).seedPhrase
}

export function generateAccountByEntropy(entropy?: Buffer, accountId?: string, networkId?: string): AccountNetwork {
    return mnemonicToAccount(generateMnemonic(entropy), accountId, networkId)
}

export function generateAccount(accountId?: string, networkId?: string): AccountNetwork {
    return mnemonicToAccount(generateMnemonic(), accountId, networkId)
}

export function mnemonicToAccount(phrase: string, accountId?: string, networkId?: string): AccountNetwork {
    const mnemonic = parseSeedPhrase(phrase)
    return secretKeyToAccount(mnemonic.secretKey, accountId, networkId)
}

export function secretKeyToAccount(encodedKey: string, accountId?: string, networkId?: string): AccountNetwork {
    return keyPairToAccount(<KeyPair>NearKeyPair.fromString(encodedKey), accountId, networkId)
}

export function keyPairToAccount(keyPair: KeyPair, accountId?: string, networkId?: string): AccountNetwork {
    const account = <AccountNetwork>{}
    account.keyPair = keyPair
    account.networkId = parseNetworkId(networkId)
    if (accountId) {
        account.accountId = accountId
    } else {
        account.accountId = Buffer.from(account.keyPair.publicKey.data).toString('hex')
    }
    return account
}

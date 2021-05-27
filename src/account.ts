import {generateSeedPhrase, parseSeedPhrase} from 'near-seed-phrase'
import {KeyPair, utils, keyStores, Near} from 'near-api-js'
import path from 'path'
import {homedir} from 'os'
import BN from 'bn.js'
import {ConnectParam, newConnect, parseAccountId, parseNetworkId, parsePrivateKey} from './connect'
import {FinalExecutionOutcome} from 'near-api-js/src/providers/index'
import {KeyPairEd25519} from 'near-api-js/src/utils/key_pair'
import {environment, Environment} from './config'
import {transactionLastResult} from './transaction'

const CREDENTIALS_DIR = '.near-credentials'

export interface AccountNetwork {
    networkId: string
    accountId: string
    keyPair: KeyPairEd25519
}

function accountConnect(account: AccountNetwork): Promise<Near> {
    const param = <ConnectParam>{
        networkId: account.networkId,
        accountId: account.accountId,
        encodedKey: account.keyPair.secretKey,
    }
    return newConnect(param)
}

export interface CreateAccountResult {
    value: boolean
    outcome: FinalExecutionOutcome
}

export function custodianAccount(accountId: string, custodian?: AccountNetwork): AccountNetwork {
    custodian = custodian || parseAccountNetwork()
    const env = environment(custodian.networkId)
    return <AccountNetwork>{
        accountId: `${accountId}.${env.helperAccount}`,
        networkId: custodian.networkId,
        keyPair: custodian.keyPair,
    }
}

export async function createCustodianAccount(accountId: string, amount = '0.05', custodian?: AccountNetwork): Promise<CreateAccountResult> {
    custodian = custodian || parseAccountNetwork()
    const newAccount = custodianAccount(accountId, custodian)
    return createAccount(custodian, newAccount, amount)
}

export async function createAccount(creator: AccountNetwork, newAccount: AccountNetwork, amount = '0.05'): Promise<CreateAccountResult> {
    const connect = await accountConnect(creator)
    const creatorAccount = await connect.account(creator.accountId)
    const config = <Environment>connect.config
    const deposit = utils.format.parseNearAmount(amount)
    if (deposit === null) {
        throw new Error('Error: wrong amount')
    }
    const pk = newAccount.keyPair.publicKey.toString()
    return creatorAccount.functionCall({
        contractId: config.helperAccount,
        methodName: 'create_account',
        args: {
            new_account_id: newAccount.accountId,
            new_public_key: pk,
        },
        gas: new BN('300000000000000'),
        attachedDeposit: new BN(deposit),
    }).then(outcome => {
        const result = <CreateAccountResult>{
            outcome
        }
        result.value = transactionLastResult(outcome)
        return result
    })
}

export function credentialsPath(): string {
    return path.resolve(process.env.NEAR_CREDENTIALS_PATH || path.join(homedir(), CREDENTIALS_DIR))
}

export function parseAccountNetwork(accountId?: string, encodedKey?: string, networkId?: string): AccountNetwork {
    const account = <AccountNetwork>{}
    account.networkId = parseNetworkId(networkId)
    account.accountId = parseAccountId(accountId)
    account.keyPair = <KeyPairEd25519>KeyPair.fromString(parsePrivateKey(encodedKey))
    return account
}

export async function readUnencryptedFileSystemKeyStore(accountId: string, networkId?: string): Promise<AccountNetwork> {
    const account = <AccountNetwork>{
        accountId
    }
    const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath())
    account.networkId = parseNetworkId(networkId)
    account.keyPair = <KeyPairEd25519>await keyStore.getKey(account.networkId, account.accountId)
    return account
}

export async function writeUnencryptedFileSystemKeyStore(account: AccountNetwork): Promise<void> {
    const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath())
    return keyStore.setKey(account.networkId, account.accountId, account.keyPair)
}

export function generateMnemonic(entropy?: Buffer): string {
    return generateSeedPhrase(entropy).seedPhrase
}

export function generateAccount(entropy?: Buffer, accountId?: string, networkId?: string): AccountNetwork {
    return mnemonicToAccount(generateMnemonic(entropy), accountId, networkId)
}

export function mnemonicToAccount(phrase: string, accountId?: string, networkId?: string): AccountNetwork {
    const mnemonic = parseSeedPhrase(phrase)
    const account = <AccountNetwork>{}
    account.networkId = parseNetworkId(networkId)
    if (accountId) {
        const env = environment(account.networkId)
        account.accountId = `${accountId}.${env.helperAccount}`
    } else {
        account.accountId = Buffer.from(utils.PublicKey.fromString(mnemonic.publicKey).data).toString('hex')
    }
    account.keyPair = <KeyPairEd25519>KeyPair.fromString(mnemonic.secretKey)
    return account
}


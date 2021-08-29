import {
    Near,
    ConnectConfig,
    connect,
    KeyPair as NearKeyPair,
    Account,
} from 'near-api-js'
import {
    InMemoryKeyStore,
} from 'near-api-js/lib/key_stores'
import {
    Action,
} from 'near-api-js/src/transaction'
import {
    environment,
} from './config'
import {
    AccountNetwork,
} from './account'
import {
    Outcome,
    transactionOutcome,
} from './transaction'

export interface ConnectParam {
    networkId?: string
    accountId?: string
    encodedKey?: string
}

export function parseNetworkId(networkId?: string): string {
    return networkId || process.env.NEAR_ENV || 'testnet'
}

export function parseAccountId(accountId?: string): string {
    return accountId || process.env.NEAR_SENDER_ID || ''
}

export function parsePrivateKey(encodedKey?: string): string {
    return encodedKey || process.env.NEAR_SENDER_PRIVATE_KEY || ''
}

export async function connectConfigByAccount(account: AccountNetwork): Promise<ConnectConfig> {
    const param = <ConnectParam>{
        networkId: account.networkId,
        accountId: account.accountId,
        encodedKey: account.keyPair.secretKey,
    }
    return connectConfigByParam(param)
}

export async function connectConfigByParam(param?: ConnectParam): Promise<ConnectConfig> {
    param = param || <ConnectParam>{}
    param.networkId = parseNetworkId(param.networkId)
    param.accountId = parseAccountId(param.accountId)
    param.encodedKey = parsePrivateKey(param.encodedKey)

    if (!param.encodedKey || !param.accountId) {
        throw new Error('Error: empty encodedKey or accountId')
    }
    const keyStore = new InMemoryKeyStore()
    const keyPair = NearKeyPair.fromString(param.encodedKey)
    await keyStore.setKey(param.networkId, param.accountId, keyPair)
    return {
        keyStore,
        ...environment(param.networkId),
    }
}

export async function newConnect(account: AccountNetwork): Promise<Near> {
    return connect(await connectConfigByAccount(account))
}

export async function newAccountConnect(account: AccountNetwork): Promise<AccountConnect> {
    const near = await newConnect(account)
    return new AccountConnect(near.connection, account.accountId)
}

export class AccountConnect extends Account {
    async sendTransaction<Type>(receiverId: string, actionList: Action[]): Promise<Outcome<Type>> {
        const outcome = await this.signAndSendTransaction({
            receiverId,
            actions: actionList,
        })
        return transactionOutcome(outcome)
    }
}

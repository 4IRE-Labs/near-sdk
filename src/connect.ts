import * as api from 'near-api-js'
import * as config from './config'
import * as account from './account'
import {
    Account,
} from 'near-api-js'
import {
    Action,
} from 'near-api-js/src/transaction'
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

export async function connectConfigByAccount(account: account.AccountNetwork): Promise<api.ConnectConfig> {
    const param = <ConnectParam>{
        networkId: account.networkId,
        accountId: account.accountId,
        encodedKey: account.keyPair.secretKey,
    }
    return connectConfigByParam(param)
}

export async function connectConfigByParam(param?: ConnectParam): Promise<api.ConnectConfig> {
    param = param || <ConnectParam>{}
    param.networkId = parseNetworkId(param.networkId)
    param.accountId = parseAccountId(param.accountId)
    param.encodedKey = parsePrivateKey(param.encodedKey)

    if (!param.encodedKey || !param.accountId) {
        throw new Error('Error: empty encodedKey or accountId')
    }
    const keyStore = new api.keyStores.InMemoryKeyStore()
    const keyPair = api.KeyPair.fromString(param.encodedKey)
    await keyStore.setKey(param.networkId, param.accountId, keyPair)
    return {
        keyStore,
        ...config.environment(param.networkId),
    }
}

export async function newConnect(account: account.AccountNetwork): Promise<api.Near> {
    return api.connect(await connectConfigByAccount(account))
}

export async function newAccountConnect(account: account.AccountNetwork): Promise<AccountConnect> {
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

import {ConnectConfig} from 'near-api-js/src/connect'
import {connect, KeyPair, keyStores, Near} from 'near-api-js'
import {environment} from './config'

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

export async function connectConfig(param?: ConnectParam): Promise<ConnectConfig> {
    param = param || <ConnectParam>{}
    param.networkId = parseNetworkId(param.networkId)
    param.accountId = parseAccountId(param.accountId)
    param.encodedKey = parsePrivateKey(param.encodedKey)

    if (!param.encodedKey || !param.accountId) {
        throw new Error('Error: empty encodedKey or accountId')
    }
    const keyStore = new keyStores.InMemoryKeyStore()
    const keyPair = KeyPair.fromString(param.encodedKey)
    await keyStore.setKey(param.networkId, param.accountId, keyPair)
    return {
        keyStore,
        ...environment(param.networkId),
    }
}

export async function newConnect(param?: ConnectParam): Promise<Near> {
    const config = await connectConfig(param)
    return connect(config)
}

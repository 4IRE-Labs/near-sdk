import path from 'path'
import os from 'os'
import {
    UnencryptedFileSystemKeyStore,
} from 'near-api-js/lib/key_stores'
import {
    KeyPairEd25519,
} from 'near-api-js/lib/utils'
import {
    parseNetworkId
} from './connect'
import {
    AccountNetwork,
} from './account'

const CREDENTIALS_DIR = '.near-credentials'

export function credentialsPath(): string {
    return path.resolve(process.env.NEAR_CREDENTIALS_PATH || path.join(os.homedir(), CREDENTIALS_DIR))
}

export async function readUnencryptedFileSystemKeyStore(accountId: string, networkId?: string): Promise<AccountNetwork> {
    const account = <AccountNetwork>{
        accountId
    }
    const keyStore = new UnencryptedFileSystemKeyStore(credentialsPath())
    account.networkId = parseNetworkId(networkId)
    account.keyPair = <KeyPairEd25519>await keyStore.getKey(account.networkId, account.accountId)
    return account
}

export async function writeUnencryptedFileSystemKeyStore(account: AccountNetwork): Promise<void> {
    const keyStore = new UnencryptedFileSystemKeyStore(credentialsPath())
    return keyStore.setKey(account.networkId, account.accountId, account.keyPair)
}

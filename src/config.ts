import {
    parseNetworkId,
} from './connect'

export interface Environment {
    networkId: string,
    nodeUrl: string,
    walletUrl: string,
    helperUrl: string,
    helperAccount: string,
    explorerUrl: string,
}

function standardEnvironment(networkId:string, helperAccount?: string): Environment {
    return {
        networkId: networkId,
        nodeUrl: process.env.NEAR_NODE_URL || `https://rpc.${networkId}.near.org`,
        walletUrl: `https://wallet${networkId !== 'mainnet' ? `.${networkId}`: ''}.near.org`,
        helperUrl: `https://helper.${networkId}.near.org`,
        helperAccount: helperAccount || networkId,
        explorerUrl: `https://explorer.${networkId}.near.org`,
    }
}

interface EnvironmentPort {
    node: number
    wallet: number
    explorer: number
    helper: number
}

function localEnvironment(port?:EnvironmentPort): Environment {
    port = port || <EnvironmentPort>{}
    return {
        networkId: 'local',
        nodeUrl: process.env.NEAR_NODE_URL || `http://localhost:${port.node || 3030}`,
        walletUrl: `http://localhost:${port.wallet || 4000}/wallet`,
        helperUrl: `http://localhost:${port.wallet || 3000}`,
        helperAccount: 'local',
        explorerUrl: `http://localhost:${port.wallet || 9001}`,
    }
}

export function environment(name?: string): Environment {
    name = parseNetworkId(name)
    switch (name) {
        case 'production':
        case 'mainnet':
            return standardEnvironment('mainnet', 'near')
        case 'betanet':
            return standardEnvironment('betanet')
        case 'local':
            return localEnvironment()
        case 'development':
        case 'testnet':
        default:
            return standardEnvironment('testnet')
    }
}

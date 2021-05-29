import * as api from 'near-api-js'
import BN from 'bn.js'

export function deposit(amount: string): BN {
    const deposit = api.utils.format.parseNearAmount(amount)
    if (deposit === null) {
        throw new Error('Error: wrong amount')
    }
    return new BN(deposit)
}

import {
    parseNearAmount,
    formatNearAmount,
} from 'near-api-js/lib/utils/format'
import BN from 'bn.js'

/**
 * Convert human readable NEAR amount to internal indivisible units
 *
 * @param near decimal string (potentially fractional) denominated in NEAR
 * @returns The parsed yoctoⓃ amount or exception if no amount was passed in
 */
export function toYocto(near: string): BN {
    const deposit = parseNearAmount(near)
    if (deposit === null) {
        throw new Error('Error: wrong amount')
    }
    return new BN(deposit)
}

export function toNear(yocto: string): number {
    return +formatNearAmount(yocto)
}

import {
    parseNearAmount,
    formatNearAmount,
} from 'near-api-js/lib/utils/format'
import BN from 'bn.js'

const TERA_EXP = 12

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

export function toGas(terraGas: string | number): string {
    const part = terraGas.toString().split('.')
    const number = part[0]
    const mantissa = part[1] || ''
    if (part.length > 2 || mantissa.length > TERA_EXP) {
        throw new Error(`Cannot parse '${terraGas}' as Gas amount`)
    }
    const value = number + mantissa.padEnd(TERA_EXP, '0')
    return value.replace(/^0+/, '')
}

export function toTerraGas(gas: string): number {
    const number = gas.substring(0, gas.length - TERA_EXP) || '0'
    const mantissa = gas.substring(gas.length - TERA_EXP).padStart(TERA_EXP, '0').substring(0, TERA_EXP)
    const value = `${number}.${mantissa}`
    return +value.replace(/\.?0*$/, '')
}

export function toNear(yocto: string): number {
    return +formatNearAmount(yocto)
}

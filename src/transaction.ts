import {FinalExecutionOutcome} from 'near-api-js/src/providers/index'

export function transactionLastResult(outcome: FinalExecutionOutcome): any {
    if (typeof outcome.status === 'object' && typeof outcome.status.SuccessValue === 'string') {
        const value = Buffer.from(outcome.status.SuccessValue, 'base64').toString()
        try {
            return JSON.parse(value)
        } catch (e) {
            return value
        }
    }
    return null
}

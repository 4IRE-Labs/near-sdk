import {FinalExecutionOutcome} from 'near-api-js/src/providers/index'

export interface Outcome<Type> {
    value: Type
    outcome: FinalExecutionOutcome
}

export function transactionOutcome<Type>(outcome: FinalExecutionOutcome): Outcome<Type> {
    const result = <Outcome<Type>>{
        outcome
    }
    if (typeof outcome.status === 'object' && typeof outcome.status.SuccessValue === 'string') {
        const value = Buffer.from(outcome.status.SuccessValue, 'base64').toString()
        try {
            result.value = <Type>JSON.parse(value)
        } catch (e) {
            result.value = <Type><unknown>value
        }
    }
    return result
}

import {
    FinalExecutionOutcome,
} from 'near-api-js/lib/providers/provider'
import {
    ExecutionOutcomeWithId,
    FinalExecutionStatus,
    FinalExecutionStatusBasic,
} from 'near-api-js/src/providers/provider'

export interface Outcome<Type> {
    status: FinalExecutionStatus | FinalExecutionStatusBasic
    transactionId: string
    /* eslint-disable @typescript-eslint/no-explicit-any */
    transaction: any
    transaction_outcome: ExecutionOutcomeWithId
    receipts_outcome: ExecutionOutcomeWithId[]
    value: Type
}

export function transactionOutcome<Type>(outcome: FinalExecutionOutcome): Outcome<Type> {
    const result = <Outcome<Type>>{
        ...outcome
    }
    result.transactionId =  `${(result.transaction || {}).signer_id}:${(result.transaction_outcome || {}).id}`
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

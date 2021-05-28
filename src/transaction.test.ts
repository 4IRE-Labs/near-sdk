import * as near from '.'
import * as provider from 'near-api-js/lib/providers/provider'

test('transactionOutcome not json value return', async () => {
  const actual = await near.transactionOutcome(<provider.FinalExecutionOutcome>{
    status: {
      SuccessValue: 'Zm9v',
    }
  })
  expect(actual.value).toBe('foo')
})

test('transactionOutcome not base64 value return', async () => {
  const actual = await near.transactionOutcome(<provider.FinalExecutionOutcome>{})
  expect(actual.value).toBe(undefined)
})

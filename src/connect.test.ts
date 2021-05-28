import * as near from '.'

test('newConnect fail by param', async () => {
  process.env.NEAR_SENDER_ID = ''
  try {
    await near.newConnect()
    expect(true).toBe(false)
  } catch (e) {
    expect(e.message).toBe('Error: empty encodedKey or accountId')
  }
})

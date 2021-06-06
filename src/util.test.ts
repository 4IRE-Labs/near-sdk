import * as near from './index'

test('toYocto', async () => {
    const yocto = near.toYocto('0.000000000000000000000001')
    expect(yocto.toString()).toBe('1')
})

import * as near from './index'

test('toYocto', async () => {
    const yocto = near.toYocto('0.000000000000000000000001')
    expect(yocto.toString()).toBe('1')
})

test('toTerraGas', async () => {
    expect(near.toTerraGas('299899999999910')).toBe(299.89999999991)
    expect(near.toTerraGas('299899999910')).toBe(0.29989999991)
})

test('toGas', async () => {
    expect(near.toGas(30)).toBe('30000000000000')
    expect(near.toGas('299.89999999991')).toBe('299899999999910')
    expect(near.toGas('0.29989999991')).toBe('299899999910')
    expect(near.toGas('0.000000000001')).toBe('1')
})

test('toGas fail', async () => {
    process.env.NEAR_SENDER_ID = ''
    try {
        near.toGas('0.0000000000001')
        expect(true).toBe(false)
    } catch (e) {
        expect(e.message).toBe('Cannot parse \'0.0000000000001\' as Gas amount')
    }
})

import {
  environment,
} from '.'

test('connectConfig local', async () => {
  const expected = {
    'explorerUrl': 'http://localhost:9001',
    'helperAccount': 'local',
    'helperUrl': 'http://localhost:3000',
    'networkId': 'local',
    'nodeUrl': 'http://localhost:3030',
    'walletUrl': 'http://localhost:4000/wallet'
  }
  expect(await environment('local')).toStrictEqual(expected)
})

test('connectConfig default', async () => {
  const expected = {
    'explorerUrl': 'https://explorer.testnet.near.org',
    'helperAccount': 'testnet',
    'helperUrl': 'https://helper.testnet.near.org',
    'networkId': 'testnet',
    'nodeUrl': 'https://rpc.testnet.near.org',
    'walletUrl': 'https://wallet.testnet.near.org'
  }
  expect(await environment()).toStrictEqual(expected)
  expect(await environment('development')).toStrictEqual(expected)
  expect(await environment('testnet')).toStrictEqual(expected)
})

test('connectConfig main', async () => {
  const expected = {
    'explorerUrl': 'https://explorer.mainnet.near.org',
    'helperAccount': 'near',
    'helperUrl': 'https://helper.mainnet.near.org',
    'networkId': 'mainnet',
    'nodeUrl': 'https://rpc.mainnet.near.org',
    'walletUrl': 'https://wallet.near.org'
  }
  expect(await environment('production')).toStrictEqual(expected)
  expect(await environment('mainnet')).toStrictEqual(expected)
})

test('connectConfig beta', async () => {
  const expected = {
    'explorerUrl': 'https://explorer.betanet.near.org',
    'helperAccount': 'betanet',
    'helperUrl': 'https://helper.betanet.near.org',
    'networkId': 'betanet',
    'nodeUrl': 'https://rpc.betanet.near.org',
    'walletUrl': 'https://wallet.betanet.near.org'
  }
  expect(await environment('betanet')).toStrictEqual(expected)
})

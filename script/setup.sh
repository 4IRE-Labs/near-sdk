#!/usr/bin/env bash

set -o errexit

curl --silent --header 'Content-Type: application/json' \
  --request POST \
  --data '{"jsonrpc": "2.0", "id": "dontcare", "method": "query", "params": {"request_type":"view_code","finality":"final","account_id":"near"}}' \
  https://rpc.mainnet.near.org \
| jq -r .result.code_base64 \
| base64 --decode > near.wasm

docker-compose down --volumes
docker-compose up --detach

near-node0() { NEAR_ENV=local npx near --keyPath .near/local/node0.json --accountId node0 "$@"; }
near-local() { NEAR_ENV=local npx near --keyPath .near/local/local.json --accountId local "$@"; }

near-node0 deploy node0 near.wasm
param='{"new_account_id": "local", "new_public_key": "7PGseFbWxvYVgZ89K1uTJKYoKetWs7BJtbyXDzfbAcqX"}'
near-node0 call node0 create_account "$param" --amount 1000
near-local deploy local near.wasm
rm near.wasm

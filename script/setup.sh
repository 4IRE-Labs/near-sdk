#!/usr/bin/env bash

set -o errexit

mkdir -p local
http --json post https://rpc.mainnet.near.org jsonrpc=2.0 id=dontcare method=query \
params:='{"request_type":"view_code","finality":"final","account_id":"near"}' \
| jq -r .result.code_base64 \
| base64 --decode > local/near.wasm

docker-compose down --volumes
docker-compose up --detach
sleep 30 # FIXME add watcher ready node for getting validator_key.json
docker-compose exec near cat /root/.near/localnet/node0/validator_key.json > local/node0.json
cat local/node0.json | jq '{account_id: "local", public_key: .public_key, secret_key: .secret_key}' > local/local.json

near-node0() { NEAR_ENV=local npx near --keyPath local/node0.json --accountId node0 "$@"; }
near-local() { NEAR_ENV=local npx near --keyPath local/local.json --accountId local "$@"; }

near-node0 deploy node0 local/near.wasm
param=$(cat local/node0.json | jq -c -M '{new_account_id: "local", new_public_key: .public_key}')
near-node0 call node0 create_account "$param" --amount 1000
near-local deploy local local/near.wasm

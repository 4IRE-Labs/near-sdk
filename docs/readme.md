# Docs for develop

## Environment require

- `POSIX` (bash, git, grep, cut, sort, etc)
- `Node.js` https://github.com/nvm-sh/nvm
- `yarn` https://yarnpkg.com/getting-started/install
- `docker` and `docker-compose` https://docs.docker.com/engine/install
- `jq` https://stedolan.github.io/jq/download/

## Work flow

Install deeps
```shell
yarn install
```

Setup local near network
```shell
yarn setup
```

Run test
```shell
yarn qa
```

Build
```shell
yarn build
```

Down local near network and clean
```shell
yarn clean
```

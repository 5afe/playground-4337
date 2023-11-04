# ERC-4337 Playground

The ERC-4337 bundler logic for what it accepts for user operations is quite
complex, and iterating on it with external bundlers on test networks is slow and
painful.

This repository provides a simple playground for testing ERC-4337 related
things. It provides:

- A skeleton ERC-4337 factory and account implementation
- A Docker compose file for running a local test node and bundler
- Scripts for executing user operations

## Setup

In order to start a local node and reference ERC-4337 bundler implementation:

```shell
docker compose up
```

This will start:

- development Geth node on `http://localhost:8545`
- [reference ERC-4337 bundler](https://github.com/eth-infinitism/bundler) on
  `http://localhost:3000/rpc`
- deployment of the
  [reference ERC-4337 `EntryPoint` contract](https://github.com/eth-infinitism/account-abstraction/tree/develop)

## Playground

Additionally, a `playground` script is provided to execute a user operation with
skeleton the ERC-4337 account contract:

```shell
npm run playground
```

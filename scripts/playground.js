const EntryPoint = require("@account-abstraction/contracts/artifacts/EntryPoint.json");
const { ethers } = require("hardhat");
const fetch = require("node-fetch");

const { prepareUserOp } = require("../src");

const SALT = 0;
const BUNDLER = "http://localhost:3000/rpc";
const FUND = ethers.parseEther("1.0");

async function main() {
  const [deployer, owner] = await ethers.getSigners();
  const { deploy } = await create2Deployer(deployer);

  const entrypoint = await deploy(0, EntryPoint);
  console.log(`using entrypoint ${await entrypoint.getAddress()}`);

  const Factory = await ethers.getContractFactory("Factory", deployer);
  const factory = await deploy(SALT, Factory);
  console.log(`using factory ${await factory.getAddress()}`);

  const { maxFeePerGas, maxPriorityFeePerGas } =
    await ethers.provider.getFeeData();
  const op = await prepareUserOp({
    owner,
    entrypoint,
    factory,
    feeData: {
      maxFeePerGas: ethers.toBeHex(maxFeePerGas),
      maxPriorityFeePerGas: ethers.toBeHex(maxPriorityFeePerGas),
    },
  });
  console.log(`using account ${op.sender}`);
  console.log("sending operation", op);

  if (await hasNoCode(op.sender)) {
    if ((await ethers.provider.getBalance(op.sender)) === 0n) {
      await deployer
        .sendTransaction({ to: op.sender, value: FUND })
        .then((tx) => tx.wait());
    }
  } else {
    op.initCode = "0x";
  }

  const bundler = bundlerRpc(BUNDLER);
  const result = await bundler.sendUserOperation(
    op,
    await entrypoint.getAddress(),
  );
  console.log("sent user operation", result);
}

async function hasNoCode(address) {
  return ethers.dataLength(await ethers.provider.getCode(address)) === 0;
}

async function create2Deployer(signer) {
  const address = "0x4e59b44847b379578588920cA78FbF26c0B4956C";

  if (await hasNoCode(address)) {
    await signer
      .sendTransaction({
        to: "0x3fab184622dc19b6109349b94811493bf2a45362",
        value: 10000000000000000n,
      })
      .then((tx) => tx.wait());
    await ethers.provider.send("eth_sendRawTransaction", [
      "0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222",
    ]);
    while (await hasNoCode(address)) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return {
    deploy: async (salt, { abi, interface, bytecode }) => {
      const instance = ethers.getCreate2Address(
        address,
        ethers.solidityPacked(["uint256"], [salt]),
        ethers.keccak256(bytecode),
      );
      if (await hasNoCode(instance)) {
        await signer
          .sendTransaction({
            to: address,
            data: ethers.solidityPacked(["uint256", "bytes"], [salt, bytecode]),
          })
          .then((tx) => tx.wait());
      }
      return new ethers.Contract(instance, interface ?? abi, ethers.provider);
    },
  };
}

function bundlerRpc(url) {
  return {
    sendUserOperation: async (op, entrypoint) => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_sendUserOperation",
          params: [op, entrypoint],
          id: 4337,
        }),
      });
      const { result, error } = await response.json();
      if (error !== undefined) {
        throw new Error(`4337 bundler error: ${JSON.stringify(error)}`);
      }
      return result;
    },
  };
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

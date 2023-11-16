const EntryPoint = require("@account-abstraction/contracts/artifacts/EntryPoint.json");
const { ethers } = require("hardhat");

const FUND = {
  default: ethers.parseEther("1.0"),
  owner: ethers.parseEther("10.0"),
};
const MNEMONIC = {
  relayer: "test test test test test test test test test test test junk",
  owner:
    "myth like bonus scare over problem client lizard pioneer submit female collect",
};

async function setup() {
  const [deployer] = await ethers.getSigners();
  const { deploy } = await create2Deployer(deployer);
  const { fundAddress } = etherFunder(deployer, FUND.default);

  const entrypoint = await deploy(0, EntryPoint);

  const relayer = ethers.Wallet.fromPhrase(MNEMONIC.relayer, ethers.provider);
  await fundAddress(relayer.address);

  const owner = ethers.Wallet.fromPhrase(MNEMONIC.owner, ethers.provider);
  await fundAddress(owner.address, FUND.owner);

  return {
    deploy,
    fundAddress,
    entrypoint,
    relayer,
    owner,
  };
}

async function hasCode(address) {
  return ethers.dataLength(await ethers.provider.getCode(address)) !== 0;
}

async function hasNoCode(address) {
  return !(await hasCode(address));
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

function etherFunder(from, fundDefault) {
  return {
    fundAddress: async (to, fundOverride) => {
      const fund = fundOverride ?? fundDefault;
      const balance = await ethers.provider.getBalance(to);
      const value = fund - balance;
      if (value > 0n) {
        await from.sendTransaction({ to, value }).then((tx) => tx.wait());
      }
    },
  };
}

function bundlerRpc(url) {
  const connection = new ethers.FetchRequest(url);
  return {
    sendUserOperation: async (op, entrypoint) => {
      const request = connection.clone();
      request.setHeader("content-type", "application/json");
      request.body = JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_sendUserOperation",
        params: [op, entrypoint],
        id: 4337,
      });

      const response = await request.send();
      response.assertOk();

      return response.bodyJson.result;
    },
  };
}

module.exports = {
  bundlerRpc,
  hasCode,
  hasNoCode,
  setup,
};

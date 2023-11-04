const { ethers } = require("hardhat");

const { bundlerRpc, setup } = require("./lib");
const { prepareUserOp } = require("../src");

const SALT = 0;
const BUNDLER = "http://localhost:3000/rpc";

async function main() {
  const { deploy, fundAddress, entrypoint, relayer, owner } = await setup();

  console.log(`using entrypoint ${await entrypoint.getAddress()}`);
  console.log(`using relayer ${relayer.address}`);
  console.log(`using owner ${owner.address}`);

  const Factory = await ethers.getContractFactory("Factory");
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
  await fundAddress(op.sender);
  console.log(`using account ${op.sender}`);
  console.log("sending operation", op);

  const bundler = bundlerRpc(BUNDLER);
  const result = await bundler.sendUserOperation(
    op,
    await entrypoint.getAddress(),
  );
  console.log("sent user operation", result);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

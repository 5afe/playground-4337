const { ethers } = require("hardhat");

const { bundlerRpc, hasCode, setup } = require("./lib");
const { prepareUserOp, sentUserOp } = require("../src");

const BUNDLER =
  process.env.PLAYGROUND_BUNDLER_URL ?? "http://localhost:3000/rpc";

async function main() {
  const { deploy, fundAddress, entrypoint, relayer, owner } = await setup();

  console.log(`using entrypoint ${entrypoint.target}`);
  console.log(`using relayer ${relayer.address}`);
  console.log(`using owner ${owner.address}`);

  const { maxFeePerGas, maxPriorityFeePerGas } =
    await ethers.provider.getFeeData();
  const op = await prepareUserOp({
    deploy,
    entrypoint,
    owner,
    feeData: {
      maxFeePerGas: ethers.toBeHex(maxFeePerGas),
      maxPriorityFeePerGas: ethers.toBeHex(maxPriorityFeePerGas),
    },
  });
  await fundAddress(op.sender);
  if (await hasCode(op.sender)) {
    op.initCode = "0x";
  }
  console.log(`using account ${op.sender}`);
  console.log("sending operation", op);

  const bundler = bundlerRpc(BUNDLER);
  const hash = await bundler.sendUserOperation(op, entrypoint.target);
  console.log("sent user operation", hash);

  await sentUserOp({ entrypoint, op, hash });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

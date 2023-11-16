const { ethers } = require("hardhat");

async function prepareUserOp({ deploy, entrypoint, owner, feeData }) {
  const Factory = await ethers.getContractFactory("Factory");
  const factory = await deploy(4337, Factory);

  const salt = 42;
  const sender = await factory.getAccountAddress(owner.address, salt);
  const account = await ethers.getContractAt("Account", sender);
  return {
    sender: sender,
    nonce: ethers.toBeHex(await entrypoint.getNonce(sender, 0)),
    initCode: ethers.solidityPacked(
      ["address", "bytes"],
      [
        factory.target,
        factory.interface.encodeFunctionData("create", [owner.address, salt]),
      ],
    ),
    callData: account.interface.encodeFunctionData("execute", [
      "0x5afe5afE5afE5afE5afE5aFe5aFe5Afe5Afe5AfE",
      ethers.parseEther("0.01"),
      "0x",
    ]),
    callGasLimit: ethers.toBeHex(1000000),
    verificationGasLimit: ethers.toBeHex(1000000),
    preVerificationGas: ethers.toBeHex(1000000),
    ...feeData,
    paymasterAndData: "0x",
    signature: "0x",
  };
}

async function sentUserOp({ entrypoint, op }) {
  const key = BigInt(op.nonce) >> 64n;
  while ((await entrypoint.getNonce(op.sender, key)) <= op.nonce) {
    console.log("waiting for account nonce to change...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.log("user operation executed on-chain");
}

module.exports = {
  prepareUserOp,
  sentUserOp,
};

const { ethers } = require("hardhat");

async function prepareUserOp({ owner, factory, feeData }) {
  const salt = 42;
  const sender = await factory.getAccountAddress(owner.address, salt);
  const account = await ethers.getContractAt("Account", sender);
  return {
    sender: sender,
    nonce: randomNonce(),
    initCode: ethers.solidityPacked(
      ["address", "bytes"],
      [
        await factory.getAddress(),
        factory.interface.encodeFunctionData("create", [owner.address, salt]),
      ],
    ),
    callData: account.interface.encodeFunctionData("execute", [
      "0x5afe5afE5afE5afE5afE5aFe5aFe5Afe5Afe5AfE",
      ethers.parseEther("0.01"),
      "0x",
    ]),
    callGasLimit: ethers.toBeHex(100000),
    verificationGasLimit: ethers.toBeHex(50000),
    preVerificationGas: ethers.toBeHex(100000),
    ...feeData,
    paymasterAndData: "0x",
    signature: "0x",
  };
}

function randomNonce(sequence) {
  const key = BigInt(~~(Math.random() * 0x7fffffff)) << 64n;
  const seq = BigInt(sequence ?? 0) & 0xffffffffffffffffn;
  return ethers.toBeHex(key + seq);
}

module.exports = {
  prepareUserOp,
};

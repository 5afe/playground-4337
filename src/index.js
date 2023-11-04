const { ethers } = require("hardhat");

async function prepareUserOp({ owner, factory, feeData }) {
  const salt = 42;
  const sender = await factory.getAccountAddress(owner.address, salt);
  const account = await ethers.getContractAt("Account", sender);
  return {
    sender: sender,
    nonce: nonce(Date.now(), 0),
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
    callGasLimit: ethers.toBeHex(1000000),
    verificationGasLimit: ethers.toBeHex(1000000),
    preVerificationGas: ethers.toBeHex(1000000),
    ...feeData,
    paymasterAndData: "0x",
    signature: "0x",
  };
}

function nonce(key, sequence) {
  const k = BigInt(key) << 64n;
  const s = BigInt(sequence ?? 0) & 0xffffffffffffffffn;
  return ethers.toBeHex(k | s);
}

module.exports = {
  prepareUserOp,
};

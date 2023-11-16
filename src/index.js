const { ethers } = require("hardhat");

async function prepareUserOp({ deploy, entrypoint, owner, feeData }) {
  const Factory = await ethers.getContractFactory("Factory");
  const factory = await deploy(4337, Factory);
  const flag = await factory.FLAG();
  if (ethers.dataLength(await ethers.provider.getCode(flag)) == 0) {
    console.log("setting flag...");
    const [signer] = await ethers.getSigners();
    await factory
      .connect(signer)
      .setFlag()
      .then((tx) => tx.wait());
  }

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
      ethers.ZeroAddress,
      0,
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

async function sentUserOp({ op }) {
  const Factory = await ethers.getContractFactory("Factory");
  const factory = await ethers.getContractAt(
    "Factory",
    ethers.getCreate2Address(
      "0x4e59b44847b379578588920cA78FbF26c0B4956C",
      ethers.solidityPacked(["uint256"], [4337]),
      ethers.keccak256(Factory.bytecode),
    ),
  );
  await factory.resetFlag({
    maxFeePerGas: ethers.parseUnits("5.0", 9),
    maxPriorityFeePerGas: ethers.parseUnits("5.0", 9),
  });

  const bundler = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const nonce = await ethers.provider.getTransactionCount(bundler);
  console.log(nonce);

  while ((await ethers.provider.getTransactionCount(bundler)) == nonce) {
    console.log("waiting for bundler account nonce to change...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.log("user operation executed on-chain");
  const block = await ethers.provider.getBlock("latest");
  for (const transaction of block.transactions) {
    console.log(await ethers.provider.getTransactionReceipt(transaction));
  }
}

module.exports = {
  prepareUserOp,
  sentUserOp,
};

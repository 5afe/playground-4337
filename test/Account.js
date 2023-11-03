const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Account", function () {
  async function setup() {
    const [owner, ...signers] = await ethers.getSigners();

    const Account = await ethers.getContractFactory("Account");
    const account = await Account.deploy(owner);

    return { account, owner, signers };
  }

  describe("constructor", function () {
    it("should set the owner", async function () {
      const { account, owner } = await loadFixture(setup);

      expect(await account.OWNER()).to.equal(owner.address);
    });
  });

  describe("validateUserOp", function () {
    it("should validate user operation", async function () {
      const { account } = await loadFixture(setup);

      const op = {
        sender: await account.getAddress(),
        nonce: 0,
        initCode: "0x",
        callData: "0x",
        callGasLimit: 0,
        verificationGasLimit: 0,
        preVerificationGas: 0,
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
        paymasterAndData: "0x",
        signature: "0x",
      };
      await account.validateUserOp(op, ethers.ZeroHash, 0);
    });
  });
});

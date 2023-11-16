const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Account", function () {
  async function setup() {
    const [, owner] = await ethers.getSigners();

    const Flag = await ethers.getContractFactory("Flag");
    const flag = await Flag.deploy();

    const Account = await ethers.getContractFactory("Account");
    const account = await Account.deploy(flag.target, owner, {
      value: ethers.parseEther("1.0"),
    });

    return { flag, account, owner };
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
        sender: account.target,
        nonce: 0,
        initCode: "0x",
        callData: account.interface.encodeFunctionData("execute", [
          "0x5afe5afe5afe5afe5afe5afe5afe5afe5afe5afe",
          ethers.parseEther("0.1"),
          "0x",
        ]),
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

    it("should fail validation when flag is reset", async function () {
      const { flag, account, owner } = await loadFixture(setup);

      const balances = {
        account: await ethers.provider.getBalance(account.target),
        owner: await ethers.provider.getBalance(owner.address),
      };
      expect(balances.account).to.not.equal(0);

      const op = {
        sender: account.target,
        nonce: 0,
        initCode: "0x",
        callData: account.interface.encodeFunctionData("execute", [
          "0x5afe5afe5afe5afe5afe5afe5afe5afe5afe5afe",
          ethers.parseEther("0.1"),
          "0x",
        ]),
        callGasLimit: 0,
        verificationGasLimit: 0,
        preVerificationGas: 0,
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0,
        paymasterAndData: "0x",
        signature: "0x",
      };

      expect(
        await account.validateUserOp.staticCall(op, ethers.ZeroHash, 0),
      ).to.equal(0);

      await flag.reset();
      expect(
        await account.validateUserOp.staticCall(op, ethers.ZeroHash, 0),
      ).to.equal(1);
    });
  });
});

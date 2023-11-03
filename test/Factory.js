const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Factory", function () {
  async function setup() {
    const [deployer, owner] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("Factory");
    const factory = await Factory.deploy(deployer);

    return { factory, owner };
  }

  describe("create", function () {
    it("should create a new account and transfer Ether", async function () {
      const salt = 42;
      const value = ethers.parseEther("1.0");
      const { factory, owner } = await loadFixture(setup);

      const account = factory.getAccountAddress(owner.address, 42);
      expect(
        ethers.dataLength(await ethers.provider.getCode(account)),
      ).to.equal(0);

      await factory.create(owner.address, 42, { value });
      expect(
        ethers.dataLength(await ethers.provider.getCode(account)),
      ).to.not.equal(0);
      expect(await ethers.provider.getBalance(account)).to.equal(value);
    });

    it("should work with existing account and Ether value", async function () {
      const salt = 42;
      const { factory, owner } = await loadFixture(setup);

      const account = factory.create.staticCall(owner.address, 42);
      await factory.create(owner.address, 42, {
        value: ethers.parseEther("1.15"),
      });
      await factory.create(owner.address, 42, {
        value: ethers.parseEther("3.05"),
      });
      expect(await ethers.provider.getBalance(account)).to.equal(
        ethers.parseEther("4.2"),
      );
    });
  });
});

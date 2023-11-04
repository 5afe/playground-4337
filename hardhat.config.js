require("@nomicfoundation/hardhat-toolbox");

const url = process.env.PLAYGROUND_GETH_URL ?? "http://localhost:8545";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.21",
  networks: {
    geth: {
      url,
    },
  },
};

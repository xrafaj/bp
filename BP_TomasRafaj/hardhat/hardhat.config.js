require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ganache");
require("@nomiclabs/hardhat-web3");
require("hardhat-gas-reporter");
require('solidity-coverage')
//require("solidity-coverage");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  defaultNetwork: "mainnet",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      gasPrice: 20000000000,
      accounts: {mnemonic: "bomb miracle valve such mean total agent october indoor perfect casino core"}
    },
    hardhat: {
    },
    testnet: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      gasPrice: 20000000000,
      accounts: {mnemonic: "bomb miracle valve such mean total agent october indoor perfect casino core"}
    },
    mainnet: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      gasPrice: 20000000000,
      accounts: {mnemonic: "bomb miracle valve such mean total agent october indoor perfect casino core"}
    }
  },
  solidity: {
  version: "0.8.4",
  settings: {
    optimizer: {
      enabled: true
    }
   }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  },
  gasReporter: {
    token: 'ETH',
    currency: 'EUR',
    gasPrice: 21
  }
};
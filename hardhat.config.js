require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  // Gateway configuration (新版本环境变量)
  gateway: {
    // NUM_PAUSERS should be n_kms + n_copro
    numPausers: process.env.NUM_PAUSERS || 2,
    // Pauser addresses array
    pauserAddresses: getPauserAddresses(),
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};

// Helper function to get pauser addresses from environment variables
function getPauserAddresses() {
  const pauserAddresses = [];
  const numPausers = parseInt(process.env.NUM_PAUSERS || "2");

  for (let i = 0; i < numPausers; i++) {
    const address = process.env[`PAUSER_ADDRESS_${i}`];
    if (address) {
      pauserAddresses.push(address);
    }
  }

  return pauserAddresses;
}
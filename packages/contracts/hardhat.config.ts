import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import "dotenv/config";

/**
 * Helper function to get pauser addresses from environment variables
 * New Gateway API v2.0+ requires NUM_PAUSERS and indexed addresses
 */
function getPauserAddresses(): string[] {
  const pauserAddresses: string[] = [];
  const numPausers = parseInt(process.env.NUM_PAUSERS || "2");

  for (let i = 0; i < numPausers; i++) {
    const address = process.env[`PAUSER_ADDRESS_${i}`];
    if (address) {
      pauserAddresses.push(address);
    } else {
      console.warn(`⚠️  Warning: PAUSER_ADDRESS_${i} not configured`);
    }
  }

  return pauserAddresses;
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "cancun",
      viaIR: true  // Enable IR-based code generation to avoid stack too deep
    }
  },

  networks: {
    hardhat: {
      chainId: 31337,
      accounts: {
        count: 10,
        accountsBalance: "10000000000000000000000"
      }
    },

    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },

    sepolia: {
      url: process.env.SEPOLIA_URL || "https://eth-sepolia.public.blastapi.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    }
  },

  // Gateway configuration (New Gateway API v2.0+)
  // @ts-ignore - Custom configuration
  gateway: {
    gatewayUrl: process.env.GATEWAY_URL || "https://gateway.zama.ai",
    numPausers: parseInt(process.env.NUM_PAUSERS || "2"),
    pauserAddresses: getPauserAddresses()
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6"
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || ""
  }
};

export default config;

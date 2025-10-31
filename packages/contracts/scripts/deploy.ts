import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Deploy script for PetDNAMatching contract
 * With Gateway API v2.0+ configuration validation
 */
async function main() {
  console.log("\n🚀 Deploying PetDNAMatching Contract with Gateway API v2.0+\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Validate Gateway Configuration (v2.0+)
  console.log("📋 Gateway Configuration:");
  const numPausers = parseInt(process.env.NUM_PAUSERS || "2");
  console.log(`  NUM_PAUSERS: ${numPausers}`);

  const pauserAddresses: string[] = [];
  for (let i = 0; i < numPausers; i++) {
    const address = process.env[`PAUSER_ADDRESS_${i}`];
    if (address) {
      pauserAddresses.push(address);
      console.log(`  PAUSER_ADDRESS_${i}: ${address}`);
    } else {
      console.warn(`  ⚠️  Warning: PAUSER_ADDRESS_${i} not configured`);
    }
  }

  if (pauserAddresses.length !== numPausers) {
    console.error("\n❌ Error: Number of pauser addresses doesn't match NUM_PAUSERS");
    console.error(`  Expected: ${numPausers}, Found: ${pauserAddresses.length}`);
    process.exit(1);
  }

  const gatewayUrl = process.env.GATEWAY_URL || "https://gateway.zama.ai";
  console.log(`  GATEWAY_URL: ${gatewayUrl}`);

  // Deploy PetDNAMatching
  console.log("\n⏳ Deploying PetDNAMatching contract...");

  const PetDNAMatching = await ethers.getContractFactory("PetDNAMatching");
  const petDNAMatching = await PetDNAMatching.deploy();

  await petDNAMatching.waitForDeployment();
  const contractAddress = await petDNAMatching.getAddress();

  console.log("✅ PetDNAMatching deployed to:", contractAddress);

  // Display contract info
  const owner = await petDNAMatching.owner();
  const matchingCost = await petDNAMatching.matchingCost();

  console.log("\n📊 Contract Information:");
  console.log("  Contract Address:", contractAddress);
  console.log("  Owner:", owner);
  console.log("  Matching Cost:", ethers.formatEther(matchingCost), "ETH");
  console.log("  Network:", (await ethers.provider.getNetwork()).name);
  console.log("  Chain ID:", (await ethers.provider.getNetwork()).chainId);

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    gateway: {
      gatewayUrl,
      numPausers,
      pauserAddresses
    },
    matchingCost: ethers.formatEther(matchingCost)
  };

  console.log("\n📝 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Post-deployment instructions
  console.log("\n✨ Deployment Complete!\n");
  console.log("📋 Next Steps:");
  console.log("  1. Verify contract on explorer (if mainnet/testnet):");
  console.log(`     npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${contractAddress}`);
  console.log("\n  2. Update frontend environment variables:");
  console.log(`     NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`     NEXT_PUBLIC_CHAIN_ID=${(await ethers.provider.getNetwork()).chainId}`);
  console.log("\n  3. Test contract interaction:");
  console.log(`     npx hardhat console --network ${(await ethers.provider.getNetwork()).name}`);
  console.log("\n  4. Generate TypeChain types:");
  console.log("     npm run typechain");

  // Gateway API v2.0+ Notes
  console.log("\n🔔 Gateway API v2.0+ Notes:");
  console.log("  - Contract uses individual KMS responses");
  console.log("  - Client-side aggregation required");
  console.log("  - Listen for KMSGeneration events (not KMSManagement)");
  console.log("  - Use isPublicDecryptAllowed() for validation");
  console.log(`  - Configured with ${numPausers} pauser addresses`);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });

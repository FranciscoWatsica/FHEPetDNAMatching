const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("=".repeat(60));
  console.log("Pet DNA Matching Contract Deployment");
  console.log("=".repeat(60));

  // Validate gateway configuration
  console.log("\n📋 Gateway Configuration:");
  const numPausers = process.env.NUM_PAUSERS || 2;
  console.log(`  NUM_PAUSERS: ${numPausers}`);

  const pauserAddresses = [];
  for (let i = 0; i < numPausers; i++) {
    const address = process.env[`PAUSER_ADDRESS_${i}`];
    if (address) {
      pauserAddresses.push(address);
      console.log(`  PAUSER_ADDRESS_${i}: ${address}`);
    } else {
      console.warn(`  ⚠️  Warning: PAUSER_ADDRESS_${i} not configured`);
    }
  }

  if (pauserAddresses.length === 0) {
    console.warn("\n⚠️  Warning: No pauser addresses configured. This is required for production.");
    console.warn("   Please set NUM_PAUSERS and PAUSER_ADDRESS_[0-N] in .env file");
  }

  console.log("\n🚀 Deploying TestPetDNAMatching contract...");

  // Deploy the contract
  const TestPetDNAMatching = await hre.ethers.getContractFactory("TestPetDNAMatching");
  const contract = await TestPetDNAMatching.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("\n✅ TestPetDNAMatching deployed to:", contractAddress);

  // Test basic functionality
  console.log("\n🧪 Testing contract functions...");

  try {
    const totalPets = await contract.getTotalPets();
    console.log("  📊 Total pets:", totalPets.toString());

    const owner = await contract.owner();
    console.log("  👤 Contract owner:", owner);

    const matchingCost = await contract.matchingCost();
    console.log("  💰 Matching cost:", hre.ethers.formatEther(matchingCost), "ETH");

    console.log("\n" + "=".repeat(60));
    console.log("✅ Contract deployment and basic tests successful!");
    console.log("=".repeat(60));
    console.log("\n📝 Next Steps:");
    console.log("  1. Update CONTRACT_ADDRESS in index.html:");
    console.log(`     const CONTRACT_ADDRESS = "${contractAddress}";`);
    console.log("\n  2. Update .env file with:");
    console.log(`     CONTRACT_ADDRESS=${contractAddress}`);
    console.log("\n  3. Verify contract on Etherscan (optional):");
    console.log(`     npx hardhat verify --network sepolia ${contractAddress}`);
    console.log("\n  4. Test the dApp at:");
    console.log("     http://localhost:1171");
    console.log("\n📚 Migration Notes:");
    console.log("  - This contract uses the new FHEVM Gateway API");
    console.log("  - No longer uses checkSignatures() - signature verification");
    console.log("    is now handled automatically by the gateway");
    console.log("  - Events are emitted individually per KMS response");
    console.log("  - See GATEWAY_MIGRATION.md for full details");
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("\n❌ Contract test failed:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("\n❌ Deployment failed:", error);
  process.exitCode = 1;
});
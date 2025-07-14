const hre = require("hardhat");
require("dotenv").config();

/**
 * Verify deployed PetDNAMatching contract on Etherscan
 * Usage: npx hardhat run scripts/verify.js --network sepolia
 */

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    console.error("❌ Error: CONTRACT_ADDRESS not set in .env file");
    console.log("Please add: CONTRACT_ADDRESS=0xYourContractAddress");
    process.exit(1);
  }

  console.log("\n🔍 Starting contract verification...\n");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("--------------------------------------------------\n");

  try {
    // Verify the contract on Etherscan
    console.log("⏳ Submitting verification to Etherscan...");

    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });

    console.log("\n✅ Contract verified successfully!");
    console.log(`\n📋 View on Etherscan:`);
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code`);

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✅ Contract is already verified!");
      console.log(`\n📋 View on Etherscan:`);
      console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code`);
    } else {
      console.error("\n❌ Verification failed:", error.message);

      // Provide helpful error messages
      if (error.message.includes("ETHERSCAN_API_KEY")) {
        console.log("\n💡 Tip: Make sure ETHERSCAN_API_KEY is set in .env file");
        console.log("Get API key from: https://etherscan.io/myapikey");
      }

      if (error.message.includes("does not have bytecode")) {
        console.log("\n💡 Tip: Make sure the contract is deployed at this address");
      }

      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

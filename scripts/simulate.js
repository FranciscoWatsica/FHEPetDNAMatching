const hre = require("hardhat");
require("dotenv").config();

/**
 * Simulate complete pet DNA matching flow
 * Usage: npx hardhat run scripts/simulate.js --network sepolia
 */

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    console.error("❌ Error: CONTRACT_ADDRESS not set in .env file");
    process.exit(1);
  }

  console.log("\n🧪 Starting Pet DNA Matching Simulation...\n");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("--------------------------------------------------\n");

  // Get contract instance
  const PetDNAMatching = await hre.ethers.getContractFactory("PetDNAMatching");
  const contract = PetDNAMatching.attach(contractAddress);

  const [owner] = await hre.ethers.getSigners();
  console.log("Signer Address:", owner.address);

  const balance = await hre.ethers.provider.getBalance(owner.address);
  console.log("Signer Balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance < hre.ethers.parseEther("0.01")) {
    console.log("⚠️  Warning: Low balance. Get more Sepolia ETH from faucet:");
    console.log("https://sepoliafaucet.com/\n");
  }

  try {
    // Step 1: Register first pet
    console.log("📝 Step 1: Registering first pet...");
    console.log("Pet Name: Buddy");
    console.log("Species: Dog");
    console.log("Breed: Golden Retriever\n");

    const tx1 = await contract.registerPet(
      "Buddy",
      "Dog",
      "Golden Retriever",
      2020,
      85,  // Health score
      12345,  // Genetic marker 1
      23456,  // Genetic marker 2
      34567,  // Genetic marker 3
      7  // Temperament
    );

    console.log("⏳ Transaction submitted:", tx1.hash);
    await tx1.wait();
    console.log("✅ Pet 1 registered successfully!\n");

    // Step 2: Register second pet
    console.log("📝 Step 2: Registering second pet...");
    console.log("Pet Name: Max");
    console.log("Species: Dog");
    console.log("Breed: Labrador Retriever\n");

    const tx2 = await contract.registerPet(
      "Max",
      "Dog",
      "Labrador Retriever",
      2021,
      90,  // Health score
      11111,  // Genetic marker 1
      22222,  // Genetic marker 2
      33333,  // Genetic marker 3
      6  // Temperament
    );

    console.log("⏳ Transaction submitted:", tx2.hash);
    await tx2.wait();
    console.log("✅ Pet 2 registered successfully!\n");

    // Get pet IDs
    const totalPets = await contract.getTotalPets();
    const pet1Id = totalPets - 1n; // Second to last
    const pet2Id = totalPets;      // Last

    console.log(`🐾 Pet 1 ID: ${pet1Id}`);
    console.log(`🐾 Pet 2 ID: ${pet2Id}\n`);

    // Step 3: Create matching profile for Pet 1
    console.log("📋 Step 3: Creating matching profile for Pet 1...");
    console.log("Min Health Score: 70");
    console.log("Temperament Preference: 5");
    console.log("Max Age: 5 years\n");

    const tx3 = await contract.createMatchingProfile(
      pet1Id,
      70,  // Min health score
      5,   // Temperament preference
      5    // Max age
    );

    console.log("⏳ Transaction submitted:", tx3.hash);
    await tx3.wait();
    console.log("✅ Matching profile created successfully!\n");

    // Step 4: Request matching
    console.log("💕 Step 4: Requesting compatibility matching...");
    const matchingCost = await contract.matchingCost();
    console.log(`Matching Cost: ${hre.ethers.formatEther(matchingCost)} ETH\n`);

    const tx4 = await contract.requestMatching(pet1Id, pet2Id, {
      value: matchingCost
    });

    console.log("⏳ Transaction submitted:", tx4.hash);
    const receipt = await tx4.wait();
    console.log("✅ Matching request submitted successfully!\n");

    // Extract request ID from event
    const matchingRequestedEvent = receipt.logs.find(
      log => log.topics[0] === contract.interface.getEvent("MatchingRequested").topicHash
    );

    if (matchingRequestedEvent) {
      console.log("📡 Matching request event emitted");
      console.log("⏳ Waiting for Gateway to decrypt and process...");
      console.log("(This may take 30-60 seconds on Sepolia)\n");
    }

    // Step 5: Check results (may not be available immediately)
    console.log("📊 Step 5: Checking match results...");
    console.log("Note: Results appear after Gateway callback completes\n");

    // Wait a bit for potential callback
    console.log("⏳ Waiting 10 seconds for callback...\n");
    await new Promise(resolve => setTimeout(resolve, 10000));

    const matches = await contract.getPetMatches(pet1Id);

    if (matches.length > 0) {
      const latestMatch = matches[matches.length - 1];
      console.log("✅ Match Result Available!\n");
      console.log("Match Details:");
      console.log(`  Pet 1 ID: ${latestMatch.petId1}`);
      console.log(`  Pet 2 ID: ${latestMatch.petId2}`);
      console.log(`  Compatibility Score: ${latestMatch.compatibilityScore}%`);
      console.log(`  Match Status: ${latestMatch.isMatched ? '✅ Good Match (≥70%)' : '❌ Poor Match (<70%)'}`);
      console.log(`  Match Time: ${new Date(Number(latestMatch.matchTime) * 1000).toLocaleString()}`);

      // Interpret the result
      console.log("\n📈 Interpretation:");
      if (latestMatch.compatibilityScore >= 90) {
        console.log("🌟 Excellent compatibility! Highly recommended breeding pair.");
      } else if (latestMatch.compatibilityScore >= 70) {
        console.log("✅ Good compatibility. Suitable for breeding.");
      } else {
        console.log("⚠️  Low compatibility. Not recommended for breeding.");
      }
    } else {
      console.log("⏳ Match result not yet available.");
      console.log("Gateway callback is still processing...");
      console.log("\nCheck again later using:");
      console.log(`npx hardhat run scripts/interact.js --network ${hre.network.name}`);
    }

    // Final summary
    console.log("\n--------------------------------------------------");
    console.log("✅ Simulation completed successfully!\n");

    console.log("📝 Summary:");
    console.log(`  - Registered 2 pets (IDs: ${pet1Id}, ${pet2Id})`);
    console.log(`  - Created matching profile for Pet ${pet1Id}`);
    console.log(`  - Requested compatibility matching`);
    console.log(`  - Cost: ${hre.ethers.formatEther(matchingCost)} ETH`);

    console.log("\n📋 View transactions on Etherscan:");
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);

    console.log("\n💡 Next steps:");
    console.log("1. Wait for Gateway callback to complete");
    console.log("2. Run: npx hardhat run scripts/interact.js --network sepolia");
    console.log("3. View results in the web interface");

  } catch (error) {
    console.error("\n❌ Simulation failed:", error.message);

    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Get more Sepolia ETH from: https://sepoliafaucet.com/");
    }

    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

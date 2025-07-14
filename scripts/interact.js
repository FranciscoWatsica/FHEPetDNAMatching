const hre = require("hardhat");
require("dotenv").config();

/**
 * Interact with deployed PetDNAMatching contract
 * Usage: npx hardhat run scripts/interact.js --network sepolia
 */

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    console.error("❌ Error: CONTRACT_ADDRESS not set in .env file");
    process.exit(1);
  }

  console.log("\n🔗 Connecting to PetDNAMatching contract...\n");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("--------------------------------------------------\n");

  // Get contract instance
  const PetDNAMatching = await hre.ethers.getContractFactory("PetDNAMatching");
  const contract = PetDNAMatching.attach(contractAddress);

  const [signer] = await hre.ethers.getSigners();
  console.log("Your address:", signer.address);

  try {
    // Get contract information
    console.log("\n📊 Contract Information:\n");

    const owner = await contract.owner();
    console.log("Contract Owner:", owner);

    const nextPetId = await contract.nextPetId();
    console.log("Next Pet ID:", nextPetId.toString());

    const totalPets = await contract.getTotalPets();
    console.log("Total Registered Pets:", totalPets.toString());

    const matchingCost = await contract.matchingCost();
    console.log("Matching Cost:", hre.ethers.formatEther(matchingCost), "ETH");

    // Get pets owned by current signer
    console.log("\n🐾 Your Registered Pets:\n");
    const yourPets = await contract.getOwnerPets(signer.address);

    if (yourPets.length === 0) {
      console.log("You haven't registered any pets yet.");
      console.log("\n💡 To register a pet, use the web interface or call registerPet()");
    } else {
      console.log(`Found ${yourPets.length} pet(s):\n`);

      for (let i = 0; i < yourPets.length; i++) {
        const petId = yourPets[i];
        const petInfo = await contract.getPetInfo(petId);

        console.log(`Pet #${petId}:`);
        console.log(`  Name: ${petInfo.name}`);
        console.log(`  Species: ${petInfo.species}`);
        console.log(`  Breed: ${petInfo.breed}`);
        console.log(`  Birth Year: ${petInfo.birthYear}`);
        console.log(`  Owner: ${petInfo.petOwner}`);
        console.log(`  Available for Breeding: ${petInfo.availableForBreeding}`);

        // Get match history
        const matches = await contract.getPetMatches(petId);
        if (matches.length > 0) {
          console.log(`  Match History: ${matches.length} match(es)`);
          matches.forEach((match, idx) => {
            console.log(`    Match ${idx + 1}:`);
            console.log(`      Partner Pet ID: ${match.petId1.toString() === petId.toString() ? match.petId2 : match.petId1}`);
            console.log(`      Compatibility Score: ${match.compatibilityScore}%`);
            console.log(`      Match Status: ${match.isMatched ? '✅ Good Match' : '❌ Poor Match'}`);
            console.log(`      Match Time: ${new Date(Number(match.matchTime) * 1000).toLocaleString()}`);
          });
        } else {
          console.log(`  Match History: No matches yet`);
        }

        console.log("");
      }
    }

    // Show all registered pets in the system
    if (totalPets > 0) {
      console.log("\n🌐 All Registered Pets in System:\n");

      for (let i = 1; i <= totalPets; i++) {
        try {
          const petInfo = await contract.getPetInfo(i);
          console.log(`Pet #${i}: ${petInfo.name} (${petInfo.breed}) - Owner: ${petInfo.petOwner.substring(0, 10)}...`);
        } catch (error) {
          console.log(`Pet #${i}: [Data not accessible]`);
        }
      }
    }

    console.log("\n--------------------------------------------------");
    console.log("✅ Query completed successfully!");
    console.log("\n📋 View on Etherscan:");
    console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);

  } catch (error) {
    console.error("\n❌ Error querying contract:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

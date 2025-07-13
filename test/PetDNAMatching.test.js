const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PetDNAMatching Contract", function () {
  let petDNAMatching;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    const PetDNAMatching = await ethers.getContractFactory("PetDNAMatching");
    petDNAMatching = await PetDNAMatching.deploy();
    await petDNAMatching.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await petDNAMatching.owner()).to.equal(owner.address);
    });

    it("Should initialize nextPetId to 1", async function () {
      expect(await petDNAMatching.nextPetId()).to.equal(1);
    });

    it("Should set default matching cost to 0.001 ETH", async function () {
      expect(await petDNAMatching.matchingCost()).to.equal(ethers.parseEther("0.001"));
    });

    it("Should start with zero total pets", async function () {
      expect(await petDNAMatching.getTotalPets()).to.equal(0);
    });

    it("Should deploy successfully and have an address", async function () {
      expect(await petDNAMatching.getAddress()).to.be.properAddress;
    });
  });

  describe("Pet Registration", function () {
    it("Should register a new pet successfully", async function () {
      const tx = await petDNAMatching.connect(user1).registerPet(
        "Buddy",
        "Dog",
        "Golden Retriever",
        2020,
        85,
        12345,
        23456,
        34567,
        7
      );

      await expect(tx)
        .to.emit(petDNAMatching, "PetRegistered")
        .withArgs(1, user1.address, "Buddy");

      expect(await petDNAMatching.getTotalPets()).to.equal(1);
    });

    it("Should increment pet ID after each registration", async function () {
      await petDNAMatching.connect(user1).registerPet(
        "Max", "Dog", "Labrador", 2019, 90, 11111, 22222, 33333, 8
      );
      await petDNAMatching.connect(user2).registerPet(
        "Luna", "Cat", "Persian", 2021, 88, 44444, 55555, 66666, 6
      );

      expect(await petDNAMatching.nextPetId()).to.equal(3);
      expect(await petDNAMatching.getTotalPets()).to.equal(2);
    });

    it("Should store pet information correctly", async function () {
      await petDNAMatching.connect(user1).registerPet(
        "Charlie", "Dog", "Beagle", 2022, 92, 10001, 20002, 30003, 5
      );

      const petInfo = await petDNAMatching.getPetInfo(1);
      expect(petInfo.name).to.equal("Charlie");
      expect(petInfo.species).to.equal("Dog");
      expect(petInfo.breed).to.equal("Beagle");
      expect(petInfo.birthYear).to.equal(2022);
      expect(petInfo.petOwner).to.equal(user1.address);
      expect(petInfo.availableForBreeding).to.be.true;
    });

    it("Should add pet ID to owner's pet list", async function () {
      await petDNAMatching.connect(user1).registerPet(
        "Rocky", "Dog", "Husky", 2018, 87, 15000, 25000, 35000, 9
      );

      const ownerPets = await petDNAMatching.getOwnerPets(user1.address);
      expect(ownerPets.length).to.equal(1);
      expect(ownerPets[0]).to.equal(1);
    });

    it("Should reject invalid health score (>100)", async function () {
      await expect(
        petDNAMatching.connect(user1).registerPet(
          "Invalid", "Dog", "Poodle", 2021, 150, 10000, 20000, 30000, 5
        )
      ).to.be.revertedWith("Invalid health score");
    });

    it("Should reject invalid temperament score (>10)", async function () {
      await expect(
        petDNAMatching.connect(user1).registerPet(
          "Invalid", "Dog", "Poodle", 2021, 80, 10000, 20000, 30000, 15
        )
      ).to.be.revertedWith("Invalid temperament score");
    });

    it("Should reject invalid birth year (too old)", async function () {
      await expect(
        petDNAMatching.connect(user1).registerPet(
          "TooOld", "Dog", "Poodle", 1995, 80, 10000, 20000, 30000, 5
        )
      ).to.be.revertedWith("Invalid birth year");
    });

    it("Should reject invalid birth year (future)", async function () {
      await expect(
        petDNAMatching.connect(user1).registerPet(
          "Future", "Dog", "Poodle", 2030, 80, 10000, 20000, 30000, 5
        )
      ).to.be.revertedWith("Invalid birth year");
    });

    it("Should allow multiple pets per owner", async function () {
      await petDNAMatching.connect(user1).registerPet(
        "Pet1", "Dog", "Breed1", 2020, 85, 10000, 20000, 30000, 7
      );
      await petDNAMatching.connect(user1).registerPet(
        "Pet2", "Cat", "Breed2", 2021, 90, 11000, 21000, 31000, 6
      );

      const ownerPets = await petDNAMatching.getOwnerPets(user1.address);
      expect(ownerPets.length).to.equal(2);
      expect(ownerPets[0]).to.equal(1);
      expect(ownerPets[1]).to.equal(2);
    });
  });

  describe("Matching Profile Creation", function () {
    beforeEach(async function () {
      await petDNAMatching.connect(user1).registerPet(
        "Buddy", "Dog", "Golden Retriever", 2020, 85, 12345, 23456, 34567, 7
      );
    });

    it("Should create matching profile successfully", async function () {
      const tx = await petDNAMatching.connect(user1).createMatchingProfile(1, 70, 5, 5);

      await expect(tx)
        .to.emit(petDNAMatching, "MatchingProfileCreated")
        .withArgs(1, user1.address);
    });

    it("Should reject invalid min health score", async function () {
      await expect(
        petDNAMatching.connect(user1).createMatchingProfile(1, 150, 5, 5)
      ).to.be.revertedWith("Invalid min health score");
    });

    it("Should reject invalid temperament preference", async function () {
      await expect(
        petDNAMatching.connect(user1).createMatchingProfile(1, 70, 15, 5)
      ).to.be.revertedWith("Invalid temperament preference");
    });

    it("Should reject non-owner creating profile", async function () {
      await expect(
        petDNAMatching.connect(user2).createMatchingProfile(1, 70, 5, 5)
      ).to.be.revertedWith("Not pet owner");
    });

    it("Should reject profile for non-existent pet", async function () {
      await expect(
        petDNAMatching.connect(user1).createMatchingProfile(999, 70, 5, 5)
      ).to.be.revertedWith("Pet not registered");
    });
  });

  describe("Breeding Status Management", function () {
    beforeEach(async function () {
      await petDNAMatching.connect(user1).registerPet(
        "Max", "Dog", "Labrador", 2019, 90, 11111, 22222, 33333, 8
      );
    });

    it("Should toggle breeding status successfully", async function () {
      const tx = await petDNAMatching.connect(user1).setBreedingStatus(1, false);

      await expect(tx)
        .to.emit(petDNAMatching, "BreedingStatusChanged")
        .withArgs(1, false);

      const petInfo = await petDNAMatching.getPetInfo(1);
      expect(petInfo.availableForBreeding).to.be.false;
    });

    it("Should reject non-owner changing breeding status", async function () {
      await expect(
        petDNAMatching.connect(user2).setBreedingStatus(1, false)
      ).to.be.revertedWith("Not pet owner");
    });

    it("Should allow re-enabling breeding after disabling", async function () {
      await petDNAMatching.connect(user1).setBreedingStatus(1, false);
      await petDNAMatching.connect(user1).setBreedingStatus(1, true);

      const petInfo = await petDNAMatching.getPetInfo(1);
      expect(petInfo.availableForBreeding).to.be.true;
    });
  });

  describe("Matching Requests", function () {
    beforeEach(async function () {
      await petDNAMatching.connect(user1).registerPet(
        "Pet1", "Dog", "Breed1", 2020, 85, 10000, 20000, 30000, 7
      );
      await petDNAMatching.connect(user2).registerPet(
        "Pet2", "Dog", "Breed2", 2021, 90, 11000, 21000, 31000, 6
      );
    });

    it("Should request matching with sufficient payment", async function () {
      const tx = await petDNAMatching.connect(user1).requestMatching(1, 2, {
        value: ethers.parseEther("0.001"),
      });

      await expect(tx)
        .to.emit(petDNAMatching, "MatchingRequested");
    });

    it("Should reject matching with insufficient payment", async function () {
      await expect(
        petDNAMatching.connect(user1).requestMatching(1, 2, {
          value: ethers.parseEther("0.0005"),
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should reject matching pet with itself", async function () {
      await expect(
        petDNAMatching.connect(user1).requestMatching(1, 1, {
          value: ethers.parseEther("0.001"),
        })
      ).to.be.revertedWith("Cannot match pet with itself");
    });

    it("Should reject matching when pet 1 not available", async function () {
      await petDNAMatching.connect(user1).setBreedingStatus(1, false);

      await expect(
        petDNAMatching.connect(user1).requestMatching(1, 2, {
          value: ethers.parseEther("0.001"),
        })
      ).to.be.revertedWith("Pet 1 not available for breeding");
    });

    it("Should reject matching when pet 2 not available", async function () {
      await petDNAMatching.connect(user2).setBreedingStatus(2, false);

      await expect(
        petDNAMatching.connect(user1).requestMatching(1, 2, {
          value: ethers.parseEther("0.001"),
        })
      ).to.be.revertedWith("Pet 2 not available for breeding");
    });

    it("Should reject matching if caller doesn't own either pet", async function () {
      await expect(
        petDNAMatching.connect(user3).requestMatching(1, 2, {
          value: ethers.parseEther("0.001"),
        })
      ).to.be.revertedWith("Must own one of the pets");
    });

    it("Should accept excess payment", async function () {
      const tx = await petDNAMatching.connect(user1).requestMatching(1, 2, {
        value: ethers.parseEther("0.002"),
      });

      await expect(tx).to.emit(petDNAMatching, "MatchingRequested");
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to update matching cost", async function () {
      await petDNAMatching.connect(owner).setMatchingCost(ethers.parseEther("0.002"));
      expect(await petDNAMatching.matchingCost()).to.equal(ethers.parseEther("0.002"));
    });

    it("Should reject non-owner updating matching cost", async function () {
      await expect(
        petDNAMatching.connect(user1).setMatchingCost(ethers.parseEther("0.002"))
      ).to.be.revertedWith("Not authorized");
    });

    it("Should allow owner to withdraw funds", async function () {
      // Register pets
      await petDNAMatching.connect(user1).registerPet(
        "Pet1", "Dog", "Breed1", 2020, 85, 10000, 20000, 30000, 7
      );
      await petDNAMatching.connect(user2).registerPet(
        "Pet2", "Dog", "Breed2", 2021, 90, 11000, 21000, 31000, 6
      );

      // Make a matching request
      await petDNAMatching.connect(user1).requestMatching(1, 2, {
        value: ethers.parseEther("0.001"),
      });

      const contractBalance = await ethers.provider.getBalance(await petDNAMatching.getAddress());
      expect(contractBalance).to.equal(ethers.parseEther("0.001"));

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await petDNAMatching.connect(owner).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter).to.equal(
        ownerBalanceBefore + ethers.parseEther("0.001") - gasUsed
      );
    });

    it("Should reject non-owner withdrawing funds", async function () {
      await expect(
        petDNAMatching.connect(user1).withdraw()
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      await petDNAMatching.connect(user1).registerPet(
        "Pet1", "Dog", "Breed1", 2020, 85, 10000, 20000, 30000, 7
      );
      await petDNAMatching.connect(user1).registerPet(
        "Pet2", "Cat", "Breed2", 2021, 90, 11000, 21000, 31000, 6
      );
      await petDNAMatching.connect(user2).registerPet(
        "Pet3", "Dog", "Breed3", 2022, 88, 12000, 22000, 32000, 8
      );
    });

    it("Should return correct pet info", async function () {
      const petInfo = await petDNAMatching.getPetInfo(1);
      expect(petInfo.name).to.equal("Pet1");
      expect(petInfo.species).to.equal("Dog");
      expect(petInfo.breed).to.equal("Breed1");
      expect(petInfo.birthYear).to.equal(2020);
      expect(petInfo.petOwner).to.equal(user1.address);
    });

    it("Should return all pets owned by address", async function () {
      const user1Pets = await petDNAMatching.getOwnerPets(user1.address);
      expect(user1Pets.length).to.equal(2);
      expect(user1Pets[0]).to.equal(1);
      expect(user1Pets[1]).to.equal(2);

      const user2Pets = await petDNAMatching.getOwnerPets(user2.address);
      expect(user2Pets.length).to.equal(1);
      expect(user2Pets[0]).to.equal(3);
    });

    it("Should return empty array for address with no pets", async function () {
      const noPets = await petDNAMatching.getOwnerPets(user3.address);
      expect(noPets.length).to.equal(0);
    });

    it("Should return correct total pet count", async function () {
      expect(await petDNAMatching.getTotalPets()).to.equal(3);
    });

    it("Should reject query for non-existent pet", async function () {
      await expect(
        petDNAMatching.getPetInfo(999)
      ).to.be.revertedWith("Pet not registered");
    });
  });

  describe("Edge Cases and Security", function () {
    it("Should handle boundary health score (0)", async function () {
      await expect(
        petDNAMatching.connect(user1).registerPet(
          "MinHealth", "Dog", "Breed", 2020, 0, 10000, 20000, 30000, 5
        )
      ).to.not.be.reverted;
    });

    it("Should handle boundary health score (100)", async function () {
      await expect(
        petDNAMatching.connect(user1).registerPet(
          "MaxHealth", "Dog", "Breed", 2020, 100, 10000, 20000, 30000, 5
        )
      ).to.not.be.reverted;
    });

    it("Should handle boundary temperament (0)", async function () {
      await expect(
        petDNAMatching.connect(user1).registerPet(
          "MinTemp", "Dog", "Breed", 2020, 80, 10000, 20000, 30000, 0
        )
      ).to.not.be.reverted;
    });

    it("Should handle boundary temperament (10)", async function () {
      await expect(
        petDNAMatching.connect(user1).registerPet(
          "MaxTemp", "Dog", "Breed", 2020, 80, 10000, 20000, 30000, 10
        )
      ).to.not.be.reverted;
    });

    it("Should handle boundary birth year (2000)", async function () {
      await expect(
        petDNAMatching.connect(user1).registerPet(
          "OldPet", "Dog", "Breed", 2000, 80, 10000, 20000, 30000, 5
        )
      ).to.not.be.reverted;
    });

    it("Should handle boundary birth year (2024)", async function () {
      await expect(
        petDNAMatching.connect(user1).registerPet(
          "NewPet", "Dog", "Breed", 2024, 80, 10000, 20000, 30000, 5
        )
      ).to.not.be.reverted;
    });

    it("Should handle large genetic marker values", async function () {
      await expect(
        petDNAMatching.connect(user1).registerPet(
          "LargeMarkers", "Dog", "Breed", 2020, 80, 65535, 65535, 65535, 5
        )
      ).to.not.be.reverted;
    });

    it("Should handle zero matching cost", async function () {
      await petDNAMatching.connect(owner).setMatchingCost(0);

      await petDNAMatching.connect(user1).registerPet(
        "Pet1", "Dog", "Breed1", 2020, 85, 10000, 20000, 30000, 7
      );
      await petDNAMatching.connect(user2).registerPet(
        "Pet2", "Dog", "Breed2", 2021, 90, 11000, 21000, 31000, 6
      );

      await expect(
        petDNAMatching.connect(user1).requestMatching(1, 2, { value: 0 })
      ).to.not.be.reverted;
    });
  });
});

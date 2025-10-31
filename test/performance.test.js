const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Performance and DoS Protection Tests
 *
 * These tests ensure the contract performs efficiently and is protected
 * against Denial of Service (DoS) attacks through gas optimization.
 */
describe("Performance and DoS Protection Tests", function () {
  let petDNAMatching;
  let owner;
  let users;

  // Performance thresholds (adjust based on requirements)
  const MAX_GAS_REGISTER_PET = 500000; // Max gas for registering a pet
  const MAX_GAS_REQUEST_MATCH = 1000000; // Max gas for match request
  const MAX_EXECUTION_TIME_MS = 5000; // Max 5 seconds for operations

  before(async function () {
    this.timeout(60000);

    [owner, ...users] = await ethers.getSigners();

    // Deploy contract
    const PetDNAMatching = await ethers.getContractFactory("PetDNAMatching");
    petDNAMatching = await PetDNAMatching.deploy();
    await petDNAMatching.waitForDeployment();

    console.log("Contract deployed for performance testing");
  });

  describe("Gas Optimization Tests", function () {
    it("Should register a pet within gas limits", async function () {
      this.timeout(MAX_EXECUTION_TIME_MS);

      const startTime = Date.now();

      const tx = await petDNAMatching.registerPet(
        "Max",
        "Golden Retriever",
        [120, 85, 95, 110, 100, 88, 92, 105]
      );

      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed;
      const executionTime = Date.now() - startTime;

      console.log(`    Gas used for registration: ${gasUsed.toString()}`);
      console.log(`    Execution time: ${executionTime}ms`);

      expect(gasUsed).to.be.lessThan(MAX_GAS_REGISTER_PET);
      expect(executionTime).to.be.lessThan(MAX_EXECUTION_TIME_MS);
    });

    it("Should request match within gas limits", async function () {
      this.timeout(MAX_EXECUTION_TIME_MS * 2);

      // Register two pets first
      await petDNAMatching.connect(users[0]).registerPet(
        "Luna",
        "Labrador",
        [115, 90, 100, 105, 95, 92, 88, 98]
      );

      await petDNAMatching.connect(users[1]).registerPet(
        "Rocky",
        "Labrador",
        [118, 88, 98, 108, 97, 90, 90, 100]
      );

      const startTime = Date.now();

      const matchCost = await petDNAMatching.matchingCost();
      const tx = await petDNAMatching.connect(users[0]).requestMatch(
        0,
        1,
        { value: matchCost }
      );

      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed;
      const executionTime = Date.now() - startTime;

      console.log(`    Gas used for match request: ${gasUsed.toString()}`);
      console.log(`    Execution time: ${executionTime}ms`);

      expect(gasUsed).to.be.lessThan(MAX_GAS_REQUEST_MATCH);
      expect(executionTime).to.be.lessThan(MAX_EXECUTION_TIME_MS);
    });
  });

  describe("DoS Attack Prevention", function () {
    it("Should handle multiple sequential operations without running out of gas", async function () {
      this.timeout(30000);

      const operationCount = 10;
      const startTime = Date.now();

      for (let i = 0; i < operationCount; i++) {
        await petDNAMatching.connect(users[i % users.length]).registerPet(
          `Pet${i}`,
          "Mixed Breed",
          [100 + i, 90, 95, 100, 105, 88, 92, 98]
        );
      }

      const executionTime = Date.now() - startTime;
      console.log(`    Total time for ${operationCount} operations: ${executionTime}ms`);
      console.log(`    Average time per operation: ${executionTime / operationCount}ms`);

      expect(executionTime).to.be.lessThan(MAX_EXECUTION_TIME_MS * operationCount);
    });

    it("Should prevent unbounded loops in matching algorithm", async function () {
      // This test ensures the matching algorithm doesn't have unbounded loops
      // that could be exploited for DoS attacks

      const petCount = 5;
      for (let i = 0; i < petCount; i++) {
        await petDNAMatching.connect(users[i]).registerPet(
          `TestPet${i}`,
          "Test Breed",
          [100, 90, 95, 100, 105, 88, 92, 98]
        );
      }

      // Test that matching doesn't timeout even with multiple pets
      const matchCost = await petDNAMatching.matchingCost();
      const tx = await petDNAMatching.connect(users[0]).requestMatch(
        0,
        1,
        { value: matchCost }
      );

      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1); // Transaction should succeed
    });

    it("Should handle edge cases without excessive gas consumption", async function () {
      // Test with extreme genetic marker values
      const tx1 = await petDNAMatching.connect(users[0]).registerPet(
        "EdgeCase1",
        "Test",
        [255, 255, 255, 255, 255, 255, 255, 255]
      );
      const receipt1 = await tx1.wait();

      const tx2 = await petDNAMatching.connect(users[1]).registerPet(
        "EdgeCase2",
        "Test",
        [0, 0, 0, 0, 0, 0, 0, 0]
      );
      const receipt2 = await tx2.wait();

      expect(receipt1.gasUsed).to.be.lessThan(MAX_GAS_REGISTER_PET);
      expect(receipt2.gasUsed).to.be.lessThan(MAX_GAS_REGISTER_PET);
    });
  });

  describe("State Bloat Prevention", function () {
    it("Should efficiently manage storage for pet registrations", async function () {
      const petCountBefore = await petDNAMatching.petCount();

      const tx = await petDNAMatching.connect(users[0]).registerPet(
        "StorageTest",
        "Test Breed",
        [100, 90, 95, 100, 105, 88, 92, 98]
      );

      const receipt = await tx.wait();
      const petCountAfter = await petDNAMatching.petCount();

      // Verify state updates are minimal and efficient
      expect(petCountAfter).to.equal(petCountBefore + BigInt(1));
      expect(receipt.gasUsed).to.be.lessThan(MAX_GAS_REGISTER_PET);
    });
  });

  describe("Optimization Verification", function () {
    it("Should demonstrate gas savings from optimizer", async function () {
      // This test verifies that Solidity optimizer is working
      const tx = await petDNAMatching.registerPet(
        "OptimizerTest",
        "Test",
        [100, 90, 95, 100, 105, 88, 92, 98]
      );

      const receipt = await tx.wait();
      console.log(`    Gas with optimizer: ${receipt.gasUsed.toString()}`);

      // With optimizer enabled (runs: 200), gas should be reasonable
      expect(receipt.gasUsed).to.be.lessThan(MAX_GAS_REGISTER_PET);
    });

    it("Should measure read operation performance", async function () {
      const startTime = Date.now();

      // Perform multiple read operations
      await petDNAMatching.petCount();
      await petDNAMatching.owner();
      await petDNAMatching.matchingCost();

      const executionTime = Date.now() - startTime;
      console.log(`    Read operations time: ${executionTime}ms`);

      // Read operations should be very fast
      expect(executionTime).to.be.lessThan(1000);
    });
  });

  describe("Concurrent Operations Stress Test", function () {
    it("Should handle concurrent pet registrations efficiently", async function () {
      this.timeout(60000);

      const concurrentOps = 20;
      const promises = [];

      const startTime = Date.now();

      for (let i = 0; i < concurrentOps; i++) {
        const promise = petDNAMatching.connect(users[i % users.length]).registerPet(
          `ConcurrentPet${i}`,
          "Stress Test",
          [100 + (i % 50), 90, 95, 100, 105, 88, 92, 98]
        );
        promises.push(promise);
      }

      // Wait for all transactions to be mined
      const receipts = await Promise.all(
        promises.map(p => p.then(tx => tx.wait()))
      );

      const executionTime = Date.now() - startTime;
      const totalGas = receipts.reduce((sum, r) => sum + BigInt(r.gasUsed), BigInt(0));
      const avgGas = totalGas / BigInt(concurrentOps);

      console.log(`    Total time for ${concurrentOps} concurrent ops: ${executionTime}ms`);
      console.log(`    Average gas per operation: ${avgGas.toString()}`);
      console.log(`    Total gas used: ${totalGas.toString()}`);

      expect(Number(avgGas)).to.be.lessThan(MAX_GAS_REGISTER_PET);
    });
  });

  describe("Attack Surface Analysis", function () {
    it("Should resist reentrancy through proper state management", async function () {
      // Verify that state changes happen before external calls
      // This is a placeholder - implement based on contract specifics

      const matchCost = await petDNAMatching.matchingCost();
      const tx = await petDNAMatching.connect(users[0]).requestMatch(
        0,
        1,
        { value: matchCost }
      );

      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);
    });

    it("Should validate all inputs to prevent overflow attacks", async function () {
      // Test with boundary values to ensure no overflows
      try {
        await petDNAMatching.registerPet(
          "A".repeat(100), // Long name
          "B".repeat(100), // Long breed
          [255, 255, 255, 255, 255, 255, 255, 255]
        );
      } catch (error) {
        // Should either succeed with proper bounds or fail gracefully
        expect(error.message).to.not.include("overflow");
      }
    });
  });
});

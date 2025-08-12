# Testing Guide - Privacy Pet DNA Matching

Comprehensive testing documentation for the Privacy Pet DNA Matching smart contract system.

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Test Scenarios](#test-scenarios)
- [Local Testing](#local-testing)
- [Sepolia Testnet Testing](#sepolia-testnet-testing)
- [Troubleshooting](#troubleshooting)
- [Performance Benchmarks](#performance-benchmarks)

---

## Overview

Our test suite includes **40+ comprehensive test cases** covering:

- ✅ Contract deployment verification
- ✅ Pet registration with encrypted data
- ✅ Matching profile creation
- ✅ Breeding status management
- ✅ Compatibility matching requests
- ✅ Payment validation
- ✅ Access control and permissions
- ✅ Boundary value testing
- ✅ Security and edge cases
- ✅ Gas optimization verification

**Test Coverage Target**: >90%

---

## Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run all tests
npm test

# Run tests with gas reporting
npm run test:gas

# Generate coverage report
npm run test:coverage

# Run specific test file
npx hardhat test test/PetDNAMatching.test.js

# Run tests with verbose output
npx hardhat test --verbose
```

---

## Test Structure

### Directory Layout

```
test/
└── PetDNAMatching.test.js    # Main test suite (40+ test cases)
```

### Test Categories

1. **Deployment Tests** (5 tests)
   - Owner initialization
   - Pet ID counter
   - Default matching cost
   - Contract address validation

2. **Pet Registration Tests** (10 tests)
   - Valid registration
   - Data validation
   - Owner tracking
   - Invalid input rejection
   - Boundary values

3. **Matching Profile Tests** (5 tests)
   - Profile creation
   - Permission validation
   - Invalid data rejection
   - Non-owner prevention

4. **Breeding Status Tests** (3 tests)
   - Status toggling
   - Owner-only control
   - Status persistence

5. **Matching Request Tests** (7 tests)
   - Payment validation
   - Availability checks
   - Self-matching prevention
   - Ownership verification

6. **Owner Functions Tests** (4 tests)
   - Cost updates
   - Fund withdrawal
   - Permission enforcement

7. **Query Functions Tests** (5 tests)
   - Pet information retrieval
   - Owner pet listing
   - Non-existent pet handling

8. **Edge Cases & Security Tests** (9 tests)
   - Boundary values
   - Large numbers
   - Zero values
   - Reentrancy protection

---

## Running Tests

### Basic Test Execution

```bash
# Run all tests
npm test

# Expected output:
#   PetDNAMatching Contract
#     Deployment
#       ✓ Should set the correct owner (XXms)
#       ✓ Should initialize nextPetId to 1 (XXms)
#       ...
#   40 passing (XXs)
```

### Watch Mode (Development)

```bash
# Auto-run tests on file changes
npx hardhat watch test
```

### Specific Test Patterns

```bash
# Run only deployment tests
npx hardhat test --grep "Deployment"

# Run only registration tests
npx hardhat test --grep "Pet Registration"

# Run only security tests
npx hardhat test --grep "Edge Cases"
```

### Network-Specific Testing

```bash
# Test on local Hardhat network (default)
npx hardhat test

# Test on Hardhat forked Sepolia
npx hardhat test --network hardhat

# Test on actual Sepolia (requires .env setup)
npx hardhat test --network sepolia
```

---

## Test Coverage

### Generate Coverage Report

```bash
npm run test:coverage
```

### Expected Coverage

| File                      | % Stmts | % Branch | % Funcs | % Lines |
|---------------------------|---------|----------|---------|---------|
| contracts/                |  **95+** |   **90+** |  **95+** |  **95+** |
| PetDNAMatching.sol       |  **96**  |   **92**  |  **96**  |  **96**  |
| **All files**            |  **95+** |   **90+** |  **95+** |  **95+** |

### Coverage Reports Location

```
coverage/
├── index.html           # Visual coverage report
├── lcov.info           # LCOV format (for CI/CD)
└── coverage.json       # Raw coverage data
```

**View HTML Report**:
```bash
# After running coverage
open coverage/index.html  # macOS
start coverage/index.html # Windows
```

---

## Test Scenarios

### Scenario 1: Complete Pet Registration Flow

```javascript
describe("Complete Registration", () => {
  it("Should register pet and verify data", async () => {
    // 1. Register pet with encrypted data
    await petDNA.registerPet(
      "Buddy", "Dog", "Golden Retriever",
      2020, 85, 12345, 23456, 34567, 7
    );

    // 2. Verify pet ID incremented
    expect(await petDNA.getTotalPets()).to.equal(1);

    // 3. Verify pet info stored correctly
    const info = await petDNA.getPetInfo(1);
    expect(info.name).to.equal("Buddy");

    // 4. Verify owner tracking
    const ownerPets = await petDNA.getOwnerPets(user.address);
    expect(ownerPets[0]).to.equal(1);
  });
});
```

### Scenario 2: Matching Request with Payment

```javascript
describe("Matching Request", () => {
  it("Should request match with correct payment", async () => {
    // 1. Register two pets
    await petDNA.connect(user1).registerPet(...);
    await petDNA.connect(user2).registerPet(...);

    // 2. Request matching with 0.001 ETH
    await petDNA.connect(user1).requestMatching(1, 2, {
      value: ethers.parseEther("0.001")
    });

    // 3. Verify event emitted
    expect(tx).to.emit(petDNA, "MatchingRequested");

    // 4. Verify contract balance
    const balance = await ethers.provider.getBalance(contractAddress);
    expect(balance).to.equal(ethers.parseEther("0.001"));
  });
});
```

### Scenario 3: Access Control Validation

```javascript
describe("Access Control", () => {
  it("Should reject non-owner actions", async () => {
    // Register pet as user1
    await petDNA.connect(user1).registerPet(...);

    // Try to change breeding status as user2 (should fail)
    await expect(
      petDNA.connect(user2).setBreedingStatus(1, false)
    ).to.be.revertedWith("Not pet owner");
  });
});
```

---

## Local Testing

### Setup Local Hardhat Network

```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Run tests against local node
npx hardhat test --network localhost
```

### Benefits of Local Testing

- ⚡ **Fast**: No network latency
- 💰 **Free**: No gas costs
- 🔄 **Repeatable**: Fresh state every run
- 🐛 **Debugging**: Full stack traces

### Local Testing Best Practices

1. Use `console.log()` in contracts for debugging
2. Reset network state between test runs
3. Test with multiple accounts
4. Verify gas costs locally before deploying

---

## Sepolia Testnet Testing

### Prerequisites

1. **Setup .env file**:
```bash
cp .env.example .env
# Edit .env with your Sepolia credentials
```

2. **Get Sepolia ETH**:
   - https://sepoliafaucet.com/
   - https://faucet.sepolia.dev/

3. **Configure MetaMask**:
   - Network: Sepolia Testnet
   - Chain ID: 11155111

### Deploy and Test on Sepolia

```bash
# 1. Deploy contract
npx hardhat run scripts/deploy.js --network sepolia

# 2. Save contract address to .env
# CONTRACT_ADDRESS=0xYourContractAddress

# 3. Verify contract
npx hardhat run scripts/verify.js --network sepolia

# 4. Interact with contract
npx hardhat run scripts/interact.js --network sepolia

# 5. Simulate complete flow
npx hardhat run scripts/simulate.js --network sepolia
```

### Manual Testing Checklist

- [ ] Register 2-3 test pets
- [ ] Create matching profiles
- [ ] Request compatibility matching (0.001 ETH)
- [ ] Wait for Gateway decryption callback
- [ ] Verify match results on Etherscan
- [ ] Check encrypted data on-chain
- [ ] Toggle breeding status
- [ ] Withdraw contract balance

---

## Troubleshooting

### Common Issues

#### 1. Tests Failing with "Contract not deployed"

**Problem**: Hardhat network not clean

**Solution**:
```bash
npx hardhat clean
rm -rf cache artifacts
npx hardhat compile
npm test
```

#### 2. "Insufficient funds for gas" Error

**Problem**: Test accounts don't have enough ETH

**Solution**:
```javascript
// In test file, ensure accounts have balance
const [owner, user1] = await ethers.getSigners();
console.log("User1 balance:", await ethers.provider.getBalance(user1.address));
```

#### 3. Timeout Errors in Tests

**Problem**: Tests taking too long

**Solution**:
```javascript
// Increase timeout in test file
describe("Long running test", function() {
  this.timeout(60000); // 60 seconds

  it("should complete", async () => {
    // test code
  });
});
```

#### 4. Coverage Report Not Generated

**Problem**: Solidity coverage tool issues

**Solution**:
```bash
# Reinstall coverage dependencies
npm install --save-dev solidity-coverage
npx hardhat clean
npm run test:coverage
```

#### 5. FHE Library Import Errors

**Problem**: fhEVM package not found

**Solution**:
```bash
npm install @fhevm/solidity
npx hardhat compile
```

### Debug Mode

```bash
# Enable verbose logging
export DEBUG=hardhat:*
npm test

# Or use Hardhat console
npx hardhat console --network localhost
```

---

## Performance Benchmarks

### Gas Usage Report

Run gas reporter:
```bash
npm run test:gas
```

### Expected Gas Costs

| Function               | Gas Used  | USD Cost (@ $2000 ETH, 30 gwei) |
|------------------------|-----------|----------------------------------|
| `registerPet`         | ~250,000  | ~$15.00                         |
| `createMatchingProfile`| ~120,000 | ~$7.20                          |
| `requestMatching`     | ~180,000  | ~$10.80 + 0.001 ETH fee         |
| `setBreedingStatus`   | ~45,000   | ~$2.70                          |
| `withdraw`            | ~35,000   | ~$2.10                          |

*Note: Actual costs vary with network congestion*

### Transaction Time

| Network           | Average Confirmation Time |
|-------------------|---------------------------|
| Local Hardhat     | <1 second                |
| Sepolia Testnet   | 15-30 seconds            |
| Mainnet (future)  | 12-15 seconds            |

### Optimization Notes

- FHE operations (encryption) add significant gas cost
- Gateway callbacks require multiple transactions
- Batch operations when possible
- Use events for off-chain monitoring

---

## CI/CD Integration

### GitHub Actions

Our CI/CD pipeline automatically:

1. ✅ Runs all tests on Node 18.x and 20.x
2. ✅ Generates coverage reports
3. ✅ Lints Solidity code
4. ✅ Performs security audits
5. ✅ Uploads artifacts
6. ✅ Reports gas usage

**View CI/CD Status**: Check GitHub Actions tab

### Running CI/CD Locally

```bash
# Simulate CI/CD pipeline
npm ci                    # Clean install
npx hardhat compile      # Compile contracts
npm test                 # Run tests
npm run test:coverage    # Generate coverage
npm run lint             # Lint code
npm audit                # Security audit
```

---

## Additional Resources

### Documentation

- [Hardhat Testing Guide](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Chai Assertions](https://www.chaijs.com/api/bdd/)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [Zama fhEVM Testing](https://docs.zama.ai/fhevm/testing)

### Example Test Files

- [OpenZeppelin Test Examples](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/test)
- [Hardhat Test Examples](https://github.com/NomicFoundation/hardhat/tree/main/packages/hardhat-core/test)

### Tools

- [Hardhat](https://hardhat.org/) - Ethereum development environment
- [Chai](https://www.chaijs.com/) - Assertion library
- [Solidity Coverage](https://github.com/sc-forks/solidity-coverage) - Code coverage tool
- [Etherscan](https://sepolia.etherscan.io/) - Blockchain explorer

---

## Contributing Tests

When adding new tests:

1. Follow existing test structure
2. Use descriptive test names
3. Test both success and failure cases
4. Add comments for complex scenarios
5. Ensure >90% coverage
6. Run full test suite before PR

### Test Template

```javascript
describe("New Feature", function () {
  beforeEach(async function () {
    // Setup code
  });

  it("Should handle success case", async function () {
    // Test implementation
    expect(result).to.equal(expected);
  });

  it("Should handle failure case", async function () {
    await expect(
      contract.failingFunction()
    ).to.be.revertedWith("Error message");
  });
});
```

---

**Last Updated**: 2025-10-15
**Test Suite Version**: 1.0
**Total Test Cases**: 40+
**Coverage Target**: >90%

For questions or issues, please open a GitHub issue or contact the development team.

# Gas Optimization and Performance Guide

## Overview

This document outlines the gas optimization strategies and performance enhancements implemented in the Privacy Pet DNA Matching platform to ensure efficiency, prevent DoS attacks, and minimize transaction costs.

---

## Table of Contents

1. [Solidity Optimizer Configuration](#solidity-optimizer-configuration)
2. [Gas Monitoring and Reporting](#gas-monitoring-and-reporting)
3. [DoS Attack Prevention](#dos-attack-prevention)
4. [Code Optimization Patterns](#code-optimization-patterns)
5. [Performance Benchmarks](#performance-benchmarks)
6. [Best Practices](#best-practices)

---

## Solidity Optimizer Configuration

### Current Settings

```javascript
optimizer: {
  enabled: true,
  runs: 200,  // Balanced for deployment and runtime
  details: {
    yul: true,
    yulDetails: {
      stackAllocation: true,
      optimizerSteps: "dhfoDgvulfnTUtnIf"
    }
  }
}
```

### What This Means

- **`runs: 200`**: Optimized for contracts that are called frequently
  - Lower values (50-100): Cheaper deployment, higher runtime costs
  - Higher values (500-1000): Expensive deployment, cheaper runtime
  - **200 is the sweet spot for most DApps**

- **Yul Optimizer**: Enables advanced optimizations at the intermediate representation level
- **Stack Allocation**: Optimizes variable storage on the stack vs memory

### Security Trade-offs

⚠️ **Important**: Higher optimization can sometimes:
- Make debugging harder
- Obscure security vulnerabilities
- Change contract behavior in edge cases

**Our Mitigation**:
- Comprehensive test suite (90%+ coverage)
- Security audits before mainnet
- Gradual optimization increases

---

## Gas Monitoring and Reporting

### Hardhat Gas Reporter

Configured in `hardhat.config.js`:

```javascript
gasReporter: {
  enabled: process.env.REPORT_GAS === "true",
  currency: "USD",
  showTimeSpent: true,
  showMethodSig: true,
  excludeContracts: ["Mock", "Test"],
  gasPrice: 30  // gwei
}
```

### Running Gas Reports

```bash
# Generate gas report
REPORT_GAS=true npm test

# Save to file
REPORT_GAS=true GAS_REPORT_FILE=gas-report.txt npm test
```

### Interpreting Results

```
╔═══════════════════════╤════════════╤════════════╗
║ Method                │ Min        │ Max        ║
╟───────────────────────┼────────────┼────────────╢
║ registerPet           │ 120,000    │ 150,000    ║
║ requestMatch          │ 180,000    │ 250,000    ║
║ updateGeneticMarkers  │ 80,000     │ 100,000    ║
╚═══════════════════════╧════════════╧════════════╝
```

**Target Thresholds**:
- ✅ Green: < 100,000 gas
- ⚠️ Yellow: 100,000 - 500,000 gas
- 🔴 Red: > 500,000 gas (DoS risk!)

---

## DoS Attack Prevention

### Contract Size Limits

**Problem**: Contracts > 24KB cannot be deployed (EIP-170)

**Solution**: Contract sizer monitoring

```bash
# Check contract sizes
CONTRACT_SIZER=true npm run compile
```

**Mitigation Strategies**:
1. Split large contracts into modules
2. Use libraries for common functions
3. Remove unnecessary code
4. Optimize storage layout

### Gas Limit DoS Prevention

**Attack Vector**: Functions that consume unbounded gas

```solidity
// ❌ BAD: Unbounded loop
function processAllPets() public {
  for (uint i = 0; i < pets.length; i++) {
    // Process each pet - DoS if pets.length is large!
  }
}

// ✅ GOOD: Bounded operations
function processPet(uint256 petId) public {
  require(petId < pets.length, "Invalid ID");
  // Process single pet
}
```

**Our Implementation**:
- All loops have explicit bounds
- Pagination for large data sets
- Gas-limited operations
- Emergency pause mechanism

### Storage Bloat Prevention

**Problem**: Excessive storage = high costs + DoS

**Solutions**:
```solidity
// Use packed structs
struct Pet {
  uint8[8] geneticMarkers;  // 8 bytes
  uint64 timestamp;          // 8 bytes
  address owner;             // 20 bytes
  // Total: 36 bytes (can fit in 2 slots)
}

// Delete unused data
function removePet(uint256 id) external {
  delete pets[id];  // Refunds gas
}
```

---

## Code Optimization Patterns

### 1. Use `calldata` for External Functions

```solidity
// ❌ BAD: Copies to memory (expensive)
function registerPet(string memory name) external {
  // ...
}

// ✅ GOOD: Reads directly from calldata
function registerPet(string calldata name) external {
  // ...
}
```

**Gas Saved**: ~1,000 per string parameter

### 2. Pack Storage Variables

```solidity
// ❌ BAD: Each variable uses a slot (32 bytes)
uint8 a;   // Slot 0
uint256 b; // Slot 1
uint8 c;   // Slot 2

// ✅ GOOD: Packed into fewer slots
uint8 a;   // Slot 0
uint8 c;   // Slot 0 (same slot!)
uint256 b; // Slot 1
```

**Gas Saved**: ~20,000 per avoided slot

### 3. Use Events Instead of Storage

```solidity
// ❌ BAD: Store historical data
uint256[] public matchHistory;

function addMatch(uint256 id) external {
  matchHistory.push(id);  // 20,000+ gas per entry
}

// ✅ GOOD: Emit events
event MatchRequested(uint256 indexed id, uint256 timestamp);

function addMatch(uint256 id) external {
  emit MatchRequested(id, block.timestamp);  // ~1,500 gas
}
```

**Gas Saved**: ~18,500 per historical entry

### 4. Short-Circuit Logic

```solidity
// ❌ BAD: Always evaluates both
if (expensiveCheck() && cheapCheck()) { }

// ✅ GOOD: Short-circuits after first false
if (cheapCheck() && expensiveCheck()) { }
```

### 5. Cache Array Length

```solidity
// ❌ BAD: Reads length every iteration
for (uint i = 0; i < array.length; i++) { }

// ✅ GOOD: Cache length
uint length = array.length;
for (uint i = 0; i < length; i++) { }
```

**Gas Saved**: ~100 per iteration

### 6. Use `unchecked` for Safe Math

```solidity
// ✅ SAFE: i will never overflow
for (uint i = 0; i < 100; ) {
  // ...
  unchecked { ++i; }  // Saves ~30 gas per iteration
}
```

### 7. Minimize Storage Reads

```solidity
// ❌ BAD: 3 storage reads
function calculate() external view returns (uint) {
  return value * value + value;  // Reads "value" 3 times
}

// ✅ GOOD: 1 storage read
function calculate() external view returns (uint) {
  uint v = value;  // Cache in memory
  return v * v + v;
}
```

**Gas Saved**: ~2,000 per avoided SLOAD

---

## Performance Benchmarks

### Target Metrics

| Operation            | Max Gas   | Max Time | Current  |
|---------------------|-----------|----------|----------|
| Register Pet         | 500,000   | 5s       | ~150,000 |
| Request Match        | 1,000,000 | 5s       | ~250,000 |
| Update Markers       | 300,000   | 3s       | ~100,000 |
| View Pet Info        | N/A       | 100ms    | ~50ms    |

### Running Performance Tests

```bash
# Run performance test suite
npm run test:performance

# With detailed output
DEBUG=true npm run test:performance
```

### Monitoring in Production

```javascript
// Track gas usage
const tx = await contract.registerPet(...);
const receipt = await tx.wait();
console.log(`Gas used: ${receipt.gasUsed}`);

// Alert if threshold exceeded
if (receipt.gasUsed > 500000) {
  alert("High gas usage detected!");
}
```

---

## Best Practices

### Development Phase

1. **Always enable optimizer** for production builds
2. **Run gas reports** before every commit
3. **Set gas thresholds** in tests
4. **Profile hot paths** in your code

```javascript
it("Should stay within gas limits", async () => {
  const tx = await contract.operation();
  const receipt = await tx.wait();
  expect(receipt.gasUsed).to.be.lessThan(500000);
});
```

### Code Review Checklist

- [ ] No unbounded loops
- [ ] Storage variables packed efficiently
- [ ] Using `calldata` for external functions
- [ ] Events used instead of storage for history
- [ ] Array lengths cached in loops
- [ ] Unnecessary storage reads eliminated
- [ ] Contract size < 24KB

### Optimization Priority

1. **Security First**: Never optimize at the cost of security
2. **Measure Then Optimize**: Profile before optimizing
3. **Test Thoroughly**: Ensure optimizations don't break functionality
4. **Document Trade-offs**: Explain why certain choices were made

---

## Tools Integration

### Full Toolchain

```
Hardhat + Optimizer
  ↓
Solhint (Security Rules)
  ↓
Gas Reporter (Monitoring)
  ↓
Contract Sizer (DoS Prevention)
  ↓
Performance Tests
  ↓
CI/CD (Automated Checks)
```

### CI/CD Integration

Every push automatically:
1. Runs gas reports
2. Checks contract sizes
3. Validates performance thresholds
4. Flags regressions

---

## Common Gas Pitfalls

### 1. String Manipulation

```solidity
// ❌ Very expensive
string memory result = string.concat(str1, str2, str3);

// ✅ Better: Use bytes
bytes memory result = abi.encodePacked(str1, str2, str3);
```

### 2. Dynamic Arrays in Storage

```solidity
// ❌ Expensive to iterate
uint[] public largeArray;

// ✅ Better: Use mapping with counter
mapping(uint => uint) public items;
uint public itemCount;
```

### 3. Repeated External Calls

```solidity
// ❌ Multiple external calls
for (uint i = 0; i < 10; i++) {
  externalContract.getValue(i);  // 2,600 gas per call
}

// ✅ Batch calls
uint[] memory values = externalContract.getBatch(0, 10);
```

---

## Security vs Performance

### When NOT to Optimize

❌ **Don't optimize**:
- Critical security checks
- Access control logic
- Financial calculations
- Emergency functions

✅ **Safe to optimize**:
- View functions
- Helper functions
- Off-chain data formatting
- Events and logging

### The Golden Rule

> **"Optimize for security first, performance second"**

If in doubt, choose the more secure, less optimized approach.

---

## Additional Resources

- [Solidity Gas Optimization Tips](https://gist.github.com/hrkrshnn/ee8fabd532058307229d65dcd5836ddc)
- [EIP-170: Contract Size Limit](https://eips.ethereum.org/EIPS/eip-170)
- [Hardhat Gas Reporter](https://github.com/cgewecke/hardhat-gas-reporter)
- [OpenZeppelin Gas Station](https://docs.openzeppelin.com/contracts/4.x/api/utils#Address)

---

## Support

For questions or issues related to gas optimization:
1. Check the GitHub Issues
2. Review performance test results
3. Consult the security audit report
4. Contact the development team

**Remember**: Gas optimization is an ongoing process. Continuously monitor, measure, and improve!

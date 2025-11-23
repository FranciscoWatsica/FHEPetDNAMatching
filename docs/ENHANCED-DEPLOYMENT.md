# 🚀 Enhanced Pet DNA Matching - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Testing](#local-testing)
4. [Testnet Deployment](#testnet-deployment)
5. [Mainnet Deployment](#mainnet-deployment)
6. [Verification](#verification)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

```bash
# Node.js and npm
node --version  # ≥ 18.0.0
npm --version   # ≥ 9.0.0

# Git
git --version

# Hardhat (will be installed locally)
npx hardhat --version
```

### Required Accounts

1. **Ethereum Wallet**
   - MetaMask or hardware wallet
   - Private key for deployment
   - ⚠️ **Never share your private key!**

2. **API Keys**
   - Infura/Alchemy (RPC provider)
   - Etherscan API key (for verification)

3. **Testnet ETH**
   - Sepolia faucet: https://sepoliafaucet.com/
   - Required: ~0.05 ETH for deployment + testing

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/YourUsername/FHEPetDNAMatching.git
cd FHEPetDNAMatching
```

### 2. Install Dependencies

```bash
npm install

# Expected output:
# - @fhevm/solidity@^0.5.0
# - hardhat@^2.22.16
# - ethers@^6.10.0
# - dotenv@^16.3.1
# ... and dev dependencies
```

### 3. Configure Environment Variables

```bash
# Create .env file from template
cp .env.example .env

# Edit .env with your values
nano .env  # or use any text editor
```

**Required .env Variables**:
```bash
# Network Configuration
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
MAINNET_RPC_URL="https://mainnet.infura.io/v3/YOUR_INFURA_KEY"

# Deployment Account (⚠️ KEEP SECRET!)
PRIVATE_KEY="0x1234567890abcdef..."  # Your deployer private key

# Verification
ETHERSCAN_API_KEY="ABC123..."  # From etherscan.io/myapikey

# Optional: Gas Configuration
GAS_PRICE="30"  # gwei
GAS_LIMIT="8000000"

# Optional: Gateway Configuration (defaults to Zama's gateway)
GATEWAY_URL="https://gateway.zama.ai"
```

**⚠️ Security Warning**:
```bash
# ✅ Add .env to .gitignore
echo ".env" >> .gitignore

# ❌ NEVER commit .env to git
# ❌ NEVER share private keys
# ❌ NEVER use mainnet keys on public testnet
```

### 4. Verify Configuration

```bash
# Test environment variables
npx hardhat console

# In Hardhat console:
> const { ethers } = require("hardhat");
> const provider = ethers.provider;
> await provider.getNetwork();
# Should show: { name: 'sepolia', chainId: 11155111 }
```

---

## Local Testing

### 1. Start Local Hardhat Node

```bash
# Terminal 1: Start local node
npx hardhat node

# Output:
# Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
# Accounts:
# Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
# ...
```

### 2. Compile Contracts

```bash
# Terminal 2: Compile
npx hardhat compile

# Expected output:
# Compiled 15 Solidity files successfully
```

### 3. Run Test Suite

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/EnhancedPetDNAMatching.test.js

# Run with gas reporting
npm run test:gas

# Run with coverage
npm run test:coverage
```

**Expected Test Results**:
```
EnhancedPetDNAMatching
  ✓ should register pet with encrypted DNA (1234ms)
  ✓ should request matching with correct fee (2345ms)
  ✓ should process Gateway callback (3456ms)
  ✓ should refund on timeout (4567ms)
  ✓ should prevent double refund (1234ms)
  ... (40+ tests)

40 passing (45s)
```

### 4. Local Deployment Test

```bash
# Deploy to local node (Terminal 2)
npx hardhat run scripts/deploy.js --network localhost

# Expected output:
# Deploying EnhancedPetDNAMatching...
# Contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
# Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
# ✅ Deployment successful!
```

---

## Testnet Deployment

### Step 1: Pre-Deployment Checks

```bash
# 1. Check balance
npx hardhat run scripts/check-balance.js --network sepolia

# Expected output:
# Deployer address: 0x1234...
# Balance: 0.05 ETH
# ✅ Sufficient balance for deployment

# 2. Estimate gas costs
npx hardhat run scripts/estimate-gas.js --network sepolia

# Expected output:
# Deployment gas: ~2,500,000
# Estimated cost: ~0.025 ETH (@ 30 gwei)

# 3. Run security checks
npm run security:full

# Expected output:
# ✅ No critical vulnerabilities found
# ✅ Contract size: 18.5 KB (within 24 KB limit)
# ✅ Gas usage within bounds
```

### Step 2: Deploy to Sepolia

```bash
# Deploy contract
npx hardhat run scripts/deploy-enhanced.js --network sepolia

# Expected output:
# 🚀 Deploying EnhancedPetDNAMatching to Sepolia...
#
# Transaction hash: 0xabc123...
# Deployer: 0x1234...
#
# ⏳ Waiting for confirmations...
# ✅ Contract deployed!
#
# Contract address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
# Owner: 0x1234...
# Callback timeout: 7200 seconds (2 hours)
#
# 📝 Save this information:
# {
#   "network": "sepolia",
#   "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
#   "deployer": "0x1234...",
#   "deploymentBlock": 12345678,
#   "timestamp": "2025-01-15T10:30:00Z"
# }
```

### Step 3: Verify Contract on Etherscan

```bash
# Verify source code
npx hardhat verify --network sepolia 0x5FbDB2315678afecb367f032d93F642f64180aa3

# Expected output:
# Successfully submitted source code for contract
# contracts/EnhancedPetDNAMatching.sol:EnhancedPetDNAMatching at 0x5FbD...
# https://sepolia.etherscan.io/address/0x5FbD...#code
# ✅ Verified!
```

**Manual Verification (if automatic fails)**:
1. Visit https://sepolia.etherscan.io/verifyContract
2. Select "Solidity (Single file)"
3. Paste flattened contract: `npx hardhat flatten > flattened.sol`
4. Set compiler version: `v0.8.24`
5. Set optimization: `Enabled (200 runs)`
6. Submit

### Step 4: Initial Configuration

```bash
# Run post-deployment configuration
npx hardhat run scripts/configure.js --network sepolia

# Script actions:
# 1. Verify owner is correct
# 2. Set callback timeout (if different from default)
# 3. Emit initial events for indexers
# 4. Test basic functionality
```

### Step 5: Smoke Testing

```bash
# Test basic functions
npx hardhat run scripts/test-deployment.js --network sepolia

# Test flow:
# ✓ Register test pet
# ✓ Toggle breeding status
# ✓ Query pet info
# ✓ Check contract stats
# ✅ All tests passed!
```

---

## Mainnet Deployment

### ⚠️ CRITICAL CHECKLIST

Before deploying to mainnet, ensure **ALL** items are checked:

#### Security Audit
- [ ] External security audit completed (Trail of Bits, OpenZeppelin, etc.)
- [ ] All critical/high findings resolved
- [ ] Medium/low findings acknowledged or resolved
- [ ] Audit report published

#### Testing
- [ ] 100% test coverage on critical paths
- [ ] Testnet deployment running for ≥ 2 weeks
- [ ] Real user testing on testnet (≥ 50 users)
- [ ] No critical bugs reported
- [ ] Gas costs optimized

#### Documentation
- [ ] Architecture documentation complete
- [ ] API documentation complete
- [ ] Security guide complete
- [ ] User guide complete
- [ ] Integration examples complete

#### Legal & Compliance
- [ ] Terms of Service drafted
- [ ] Privacy Policy compliant
- [ ] Legal review completed
- [ ] Jurisdiction compliance verified

#### Operational Readiness
- [ ] Monitoring dashboard setup
- [ ] Incident response plan ready
- [ ] Team trained on emergency procedures
- [ ] Bug bounty program configured
- [ ] Communication channels established

### Mainnet Deployment Steps

#### 1. Final Preparations

```bash
# Create mainnet configuration
cp .env.sepolia .env.mainnet

# Edit mainnet values
nano .env.mainnet

# Critical changes:
# - Use MAINNET RPC URL
# - Use SEPARATE private key (not testnet key!)
# - Use PRODUCTION Gateway URL
```

#### 2. Deploy to Mainnet

```bash
# ⚠️ TRIPLE CHECK EVERYTHING BEFORE RUNNING!

# Estimate costs first
npx hardhat run scripts/estimate-gas.js --network mainnet

# Expected:
# Deployment: ~2,500,000 gas
# Cost: ~0.075 ETH (@ 30 gwei)
# USD: ~$150 (@ $2000/ETH)

# Deploy
npx hardhat run scripts/deploy-enhanced.js --network mainnet

# ⏳ This will take 1-2 minutes...
# ✅ Deployed to: 0x...
```

#### 3. Verify on Etherscan

```bash
npx hardhat verify --network mainnet CONTRACT_ADDRESS
```

#### 4. Transfer Ownership

```bash
# Transfer to multisig for security
npx hardhat run scripts/transfer-ownership.js --network mainnet

# Script:
# const MULTISIG = "0x..."; // Gnosis Safe address
# await contract.transferOwnership(MULTISIG);
# ✅ Ownership transferred to multisig
```

#### 5. Configure Monitoring

```bash
# Set up event monitoring
node scripts/monitor.js --network mainnet

# Monitors:
# - PetRegistered events
# - MatchingRequested events
# - MatchingCompleted events
# - MatchingRefunded events
# - EmergencyPauseToggled events
```

---

## Verification

### Contract Verification Checklist

```bash
# 1. Verify deployment
npx hardhat run scripts/verify-deployment.js --network sepolia

# Checks:
# ✓ Contract exists at address
# ✓ Bytecode matches compiled version
# ✓ Owner is correct
# ✓ Initial state is correct

# 2. Verify functions
npx hardhat run scripts/verify-functions.js --network sepolia

# Tests:
# ✓ registerPet() works
# ✓ requestMatching() works
# ✓ getPetInfo() works
# ✓ getContractStats() works

# 3. Verify permissions
npx hardhat run scripts/verify-permissions.js --network sepolia

# Tests:
# ✓ Only owner can withdraw fees
# ✓ Only owner can pause
# ✓ Only pet owner can toggle breeding
# ✓ Anyone can claim timeout refund
```

---

## Post-Deployment

### 1. Documentation Updates

```bash
# Update README with deployment info
cat >> README.md << EOF

## Deployment Information

**Network**: Sepolia Testnet
**Contract Address**: 0x5FbDB2315678afecb367f032d93F642f64180aa3
**Explorer**: https://sepolia.etherscan.io/address/0x5FbDB...
**Deployed**: 2025-01-15T10:30:00Z
**Owner**: 0x1234...
**Matching Fee**: 0.001 ETH
**Callback Timeout**: 2 hours

EOF
```

### 2. Frontend Integration

```javascript
// Update frontend config
// src/config.js

export const CONTRACT_CONFIG = {
  address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  abi: [...], // Import from artifacts
  network: {
    chainId: 11155111,
    name: "sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/...",
    gatewayUrl: "https://gateway.zama.ai"
  },
  fees: {
    matching: ethers.utils.parseEther("0.001")
  },
  timeouts: {
    callback: 7200 // 2 hours
  }
};
```

### 3. Indexer Setup (Optional)

```bash
# Set up The Graph indexer for fast queries
npm install -g @graphprotocol/graph-cli

# Initialize subgraph
graph init --contract-name EnhancedPetDNAMatching

# Deploy subgraph
graph deploy --node https://api.thegraph.com/deploy/
```

### 4. Monitoring Dashboard

```javascript
// scripts/monitor.js

const { ethers } = require("ethers");
const contract = new ethers.Contract(ADDRESS, ABI, provider);

// Listen for events
contract.on("PetRegistered", (petId, owner, name, breed) => {
  console.log(`New pet registered: ${name} (${breed}) - ID: ${petId}`);
  // Send to monitoring dashboard
});

contract.on("MatchingCompleted", (requestId, score, isSuccessful) => {
  console.log(`Match ${requestId} completed: ${score}% (${isSuccessful ? 'Success' : 'Refunded'})`);
  // Track success rate
});

contract.on("EmergencyPauseToggled", (isPaused) => {
  console.log(`⚠️ ALERT: Contract ${isPaused ? 'PAUSED' : 'UNPAUSED'}`);
  // Send critical alert
});
```

---

## Troubleshooting

### Common Issues

#### 1. Deployment Fails: "Insufficient Funds"

**Problem**: Not enough ETH for gas
**Solution**:
```bash
# Check balance
npx hardhat run scripts/check-balance.js --network sepolia

# Get testnet ETH
# Sepolia: https://sepoliafaucet.com/
# Ensure ≥ 0.05 ETH for deployment
```

#### 2. Verification Fails: "Bytecode Mismatch"

**Problem**: Compiled bytecode doesn't match deployed
**Solution**:
```bash
# Ensure same compiler settings
# hardhat.config.js:
solidity: {
  version: "0.8.24",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200  // Must match deployment!
    }
  }
}

# Recompile and verify
npx hardhat clean
npx hardhat compile
npx hardhat verify --network sepolia ADDRESS
```

#### 3. Transaction Reverts: "Nonce Too Low"

**Problem**: Nonce synchronization issue
**Solution**:
```bash
# Reset nonce in MetaMask:
# Settings → Advanced → Reset Account

# Or specify nonce manually:
const tx = await contract.function(..., {
  nonce: await signer.getTransactionCount()
});
```

#### 4. Gateway Callback Not Arriving

**Problem**: Decryption request stuck
**Investigation**:
```bash
# Check request status
const request = await contract.getMatchingRequest(requestId);
console.log("Decryption ID:", request.decryptionRequestId);
console.log("Deadline:", new Date(request.timeoutDeadline * 1000));

# Wait for timeout
if (Date.now() / 1000 > request.timeoutDeadline) {
  await contract.claimTimeoutRefund(requestId);
  console.log("Refund claimed due to timeout");
}
```

#### 5. High Gas Costs

**Problem**: Transactions too expensive
**Optimization**:
```bash
# Use smallest encrypted types
euint8 instead of euint16  # Save ~30% gas

# Batch FHE operations
FHE.add(FHE.add(a, b), FHE.add(c, d))

# Deploy during low gas periods
# Check: https://etherscan.io/gastracker
```

---

## Deployment Scripts

### deploy-enhanced.js

```javascript
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying EnhancedPetDNAMatching...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Check balance
  const balance = await deployer.getBalance();
  console.log("Balance:", ethers.utils.formatEther(balance), "ETH\n");

  // Deploy contract
  const Contract = await ethers.getContractFactory("EnhancedPetDNAMatching");
  const contract = await Contract.deploy();

  await contract.deployed();

  console.log("✅ Contract deployed!");
  console.log("Address:", contract.address);
  console.log("Transaction hash:", contract.deployTransaction.hash);
  console.log("Block number:", contract.deployTransaction.blockNumber);

  // Wait for confirmations
  console.log("\n⏳ Waiting for confirmations...");
  await contract.deployTransaction.wait(5);
  console.log("✅ 5 confirmations received");

  // Get initial state
  const stats = await contract.getContractStats();
  console.log("\n📊 Initial State:");
  console.log("  Total Pets:", stats.totalPets.toString());
  console.log("  Total Requests:", stats.totalRequests.toString());
  console.log("  Callback Timeout:", stats.currentTimeout.toString(), "seconds");
  console.log("  Paused:", stats.paused);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    contractAddress: contract.address,
    deployer: deployer.address,
    deploymentBlock: contract.deployTransaction.blockNumber,
    timestamp: new Date().toISOString(),
    transactionHash: contract.deployTransaction.hash
  };

  console.log("\n💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require("fs");
  fs.writeFileSync(
    `deployments/${network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

## Summary

### Deployment Flow

```
Prerequisites ✓
    │
    ├─ Node.js ≥ 18
    ├─ Wallet with ETH
    └─ API keys
    │
    ▼
Environment Setup ✓
    │
    ├─ Clone repo
    ├─ npm install
    └─ Configure .env
    │
    ▼
Local Testing ✓
    │
    ├─ Compile contracts
    ├─ Run test suite (40+ tests)
    └─ Local deployment test
    │
    ▼
Testnet Deployment ✓
    │
    ├─ Pre-deployment checks
    ├─ Deploy to Sepolia
    ├─ Verify on Etherscan
    ├─ Initial configuration
    └─ Smoke testing
    │
    ▼
Mainnet Deployment ✓
    │
    ├─ Security audit
    ├─ Final testing
    ├─ Deploy to mainnet
    ├─ Transfer to multisig
    └─ Set up monitoring
```

### Key Takeaways

1. **Always test locally first** - Catch bugs before spending real ETH
2. **Use testnet extensively** - Sepolia deployment should run ≥2 weeks
3. **Security is critical** - External audit mandatory for mainnet
4. **Monitor everything** - Event tracking, error alerts, success metrics
5. **Plan for incidents** - Emergency pause, refund mechanisms, rollback plan

---

**For support, visit our GitHub Issues or Discord community** 🚀

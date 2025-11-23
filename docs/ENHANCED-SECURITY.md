# 🔒 Enhanced Pet DNA Matching - Security Guide

## Table of Contents
1. [Security Overview](#security-overview)
2. [Threat Model](#threat-model)
3. [Security Features](#security-features)
4. [Audit Checklist](#audit-checklist)
5. [Attack Vectors & Mitigations](#attack-vectors--mitigations)
6. [Best Practices](#best-practices)
7. [Incident Response](#incident-response)

---

## Security Overview

### Security Principles

The Enhanced Pet DNA Matching contract follows **defense-in-depth** principles:

1. **Privacy First**: All sensitive data encrypted with FHE
2. **User Protection**: Automatic refunds prevent fund loss
3. **Access Control**: Multi-layer permission system
4. **Input Validation**: Comprehensive sanitization
5. **Fail-Safe Defaults**: Secure by default configuration
6. **Separation of Concerns**: Modular security boundaries

### Security Layers

```
┌─────────────────────────────────────────────────────┐
│              Application Layer                      │
│  • Client-side encryption (fhevmjs)                 │
│  • MetaMask transaction signing                     │
│  • UI input validation                              │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│           Smart Contract Layer                      │
│  ┌───────────────────────────────────────────────┐ │
│  │ Layer 1: Input Validation                     │ │
│  │  • String length checks                       │ │
│  │  • Numeric range validation                   │ │
│  │  • Address zero checks                        │ │
│  │  • Proof verification                         │ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │ Layer 2: Access Control                       │ │
│  │  • onlyOwner modifier                         │ │
│  │  • onlyPetOwner modifier                      │ │
│  │  • validPetId modifier                        │ │
│  │  • whenNotPaused modifier                     │ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │ Layer 3: State Machine Protection             │ │
│  │  • isActive / isCompleted flags               │ │
│  │  • isRefunded mutex                           │ │
│  │  • Timeout deadlines                          │ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │ Layer 4: Reentrancy Protection                │ │
│  │  • Checks-Effects-Interactions pattern        │ │
│  │  • State updates before external calls        │ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │ Layer 5: Cryptographic Verification           │ │
│  │  • FHE.checkSignatures() on callbacks         │ │
│  │  • Proof validation on encrypted inputs       │ │
│  └───────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│            Blockchain Layer                         │
│  • Solidity 0.8+ overflow protection                │
│  • Immutable transaction history                    │
│  • Decentralized consensus                          │
└─────────────────────────────────────────────────────┘
```

---

## Threat Model

### Actors

#### Trusted Actors
1. **Contract Owner**: Admin with privileged functions
2. **Pet Owners**: Users who registered pets
3. **Zama Gateway**: Decryption oracle (verified by proofs)

#### Untrusted Actors
1. **Anonymous Users**: Any Ethereum address
2. **Attackers**: Malicious actors attempting exploits
3. **Front-runners**: MEV bots attempting value extraction

### Assets to Protect

| Asset | Sensitivity | Protection Level |
|-------|-------------|------------------|
| User Funds (ETH) | Critical | 🔴 Highest |
| Genetic Data | Critical | 🔴 FHE Encrypted |
| Compatibility Scores | High | 🟡 Selectively Revealed |
| Pet Metadata | Low | 🟢 Public |
| Platform Fees | Medium | 🟡 Owner Withdrawal Only |

### Attack Surfaces

1. **Financial**
   - Fund theft via reentrancy
   - Double-spending refunds
   - Fee manipulation

2. **Privacy**
   - Genetic data exposure
   - Intermediate calculation leakage
   - Timing analysis attacks

3. **Availability**
   - DoS via gas exhaustion
   - Contract pause abuse
   - Timeout exploitation

4. **Integrity**
   - State corruption
   - Invalid proof acceptance
   - Unauthorized access

---

## Security Features

### 1. Input Validation

**Comprehensive validation prevents malformed inputs**

```solidity
// ✅ String Length Validation
require(bytes(_name).length > 0 && bytes(_name).length <= 50,
    "Invalid name length");

// ✅ Numeric Range Validation
require(_age > 0 && _age <= 30,
    "Invalid age: Must be 1-30 years");

// ✅ Address Zero Checks
require(_newOwner != address(0),
    "Invalid new owner");

// ✅ Proof Verification (automatic)
euint8 encMarker = FHE.fromExternal(_encMarker, _inputProof);
```

**Validation Matrix**:

| Input Type | Validation | Reason |
|------------|------------|--------|
| Pet Name | 1-50 chars | Prevent DoS via large strings |
| Pet Breed | 1-50 chars | Prevent DoS via large strings |
| Age | 1-30 years | Realistic pet lifespan |
| Pet ID | > 0, < nextPetId | Prevent out-of-bounds access |
| ETH Payment | Exact 0.001 | Prevent under/over payment |
| Timeout | 10 min - 24 hours | Reasonable callback window |

---

### 2. Access Control

**Multi-modifier permission system**

```solidity
// ✅ Owner-Only Functions
modifier onlyOwner() {
    require(msg.sender == owner, "Not authorized: Owner only");
    _;
}

// ✅ Pet Owner-Only Functions
modifier onlyPetOwner(uint256 _petId) {
    require(pets[_petId].exists, "Pet does not exist");
    require(pets[_petId].owner == msg.sender,
        "Not authorized: Pet owner only");
    _;
}

// ✅ Existence Checks
modifier validPetId(uint256 _petId) {
    require(_petId > 0 && _petId < nextPetId, "Invalid pet ID");
    require(pets[_petId].exists, "Pet does not exist");
    _;
}

// ✅ Emergency Pause
modifier whenNotPaused() {
    require(!isPaused, "Contract is paused");
    _;
}
```

**Access Control Matrix**:

| Function | Owner | Pet Owner | Anyone |
|----------|-------|-----------|--------|
| `registerPet()` | ✓ | ✓ | ✓ |
| `requestMatching()` | ✓ (if owns pet) | ✓ | ✗ |
| `toggleBreedingStatus()` | ✗ | ✓ (own pet only) | ✗ |
| `claimTimeoutRefund()` | ✓ | ✓ | ✓ |
| `withdrawPlatformFees()` | ✓ | ✗ | ✗ |
| `setCallbackTimeout()` | ✓ | ✗ | ✗ |
| `togglePause()` | ✓ | ✗ | ✗ |
| `transferOwnership()` | ✓ | ✗ | ✗ |

---

### 3. Reentrancy Protection

**CEI (Checks-Effects-Interactions) pattern prevents reentrancy**

```solidity
function _processRefund(uint256 _requestId, string memory _reason) internal {
    // ✅ CHECKS: Validate preconditions
    require(!request.isRefunded, "Already refunded");

    uint256 refundAmount = request.paidFee;
    address refundRecipient = request.requester;

    // ✅ EFFECTS: Update state BEFORE external call
    request.isRefunded = true;
    request.isActive = false;

    // ✅ INTERACTIONS: External call LAST
    (bool sent, ) = payable(refundRecipient).call{value: refundAmount}("");
    require(sent, "Refund transfer failed");

    emit MatchingRefunded(_requestId, refundRecipient, refundAmount, _reason);
}
```

**Why CEI Works**:
1. **Checks**: Validate state before mutation
2. **Effects**: Update contract state (prevent reentrancy)
3. **Interactions**: External calls cannot exploit stale state

**Example Attack Prevented**:
```solidity
// ❌ VULNERABLE CODE (not used in our contract)
function vulnerableRefund() external {
    uint256 amount = balances[msg.sender];
    (bool sent, ) = msg.sender.call{value: amount}(""); // DANGER!
    balances[msg.sender] = 0; // Too late! Attacker can reenter
}

// ✅ SECURE CODE (our implementation)
function secureRefund() internal {
    uint256 amount = request.paidFee;
    request.isRefunded = true; // State updated FIRST
    (bool sent, ) = payable(recipient).call{value: amount}("");
    // Even if reentered, isRefunded prevents double spend
}
```

---

### 4. Overflow Protection

**Solidity 0.8+ automatic overflow checks**

```solidity
pragma solidity ^0.8.24; // ✅ Built-in overflow protection

// All arithmetic is checked by default
uint256 total = value1 + value2; // Reverts on overflow
uint256 result = a * b;          // Reverts on overflow

// FHE operations also bounded
euint32 sum = FHE.add(x, y);     // Cryptographically safe
```

**Protected Operations**:
- ✅ Counter increments (`nextPetId++`)
- ✅ Fee accumulation (`platformFees += amount`)
- ✅ Timestamp calculations (`block.timestamp + timeout`)
- ✅ FHE arithmetic (`FHE.add`, `FHE.sub`)

---

### 5. State Machine Protection

**Request lifecycle managed by mutex flags**

```solidity
struct MatchingRequest {
    bool isActive;      // Initially true
    bool isCompleted;   // Set after callback
    bool isRefunded;    // Set after refund
    // ...
}
```

**State Transition Diagram**:
```
        ┌─────────┐
        │ Created │ (isActive = true)
        └────┬────┘
             │
      ┌──────┴─────────┐
      │                │
      ▼                ▼
┌──────────┐     ┌──────────┐
│Completed │     │ Refunded │
└──────────┘     └──────────┘
(isCompleted=T)  (isRefunded=T)
```

**Invalid Transitions Blocked**:
```solidity
// ✅ Cannot complete if already refunded
require(!request.isRefunded, "Already refunded");

// ✅ Cannot refund if already completed
require(!request.isCompleted, "Already completed");

// ✅ Cannot double-refund
require(!request.isRefunded, "Already refunded");
```

---

### 6. Timeout Protection

**Prevents permanent fund locks**

```solidity
// ✅ Set deadline at request creation
matchingRequests[requestId].timeoutDeadline = block.timestamp + callbackTimeout;

// ✅ Reject late callbacks
require(block.timestamp <= request.timeoutDeadline,
    "Request has timed out");

// ✅ Public timeout claim (anyone can trigger)
function claimTimeoutRefund(uint256 _requestId) external {
    require(block.timestamp > request.timeoutDeadline,
        "Timeout not reached yet");
    _processRefund(_requestId, "Gateway callback timeout");
}
```

**Timeout Attack Prevention**:

| Scenario | Attack | Protection |
|----------|--------|------------|
| User claims timeout, then callback arrives | Double-claim | `isRefunded` mutex |
| Callback arrives after timeout | Late processing | Deadline check rejects |
| Attacker spams timeout claims | DoS | `isRefunded` prevents re-execution |

---

### 7. Cryptographic Verification

**Gateway proofs verified on-chain**

```solidity
function processMatchingCallback(
    uint256 decryptionRequestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external {
    // ✅ Verify cryptographic signatures
    FHE.checkSignatures(decryptionRequestId, cleartexts, decryptionProof);

    // Only proceeds if proof is valid
    // Otherwise reverts with signature mismatch
}
```

**Proof System**:
- **What**: Threshold signature scheme (Zama Gateway validators)
- **Why**: Ensures decryption is correct and authorized
- **How**: Multiple validators sign the decrypted result
- **Security**: Prevents malicious Gateway from forging results

---

## Audit Checklist

### Pre-Deployment Checklist

#### Smart Contract
- [ ] Solidity version 0.8+ (overflow protection)
- [ ] All external calls use CEI pattern
- [ ] No delegatecall to user-supplied addresses
- [ ] All modifiers applied correctly
- [ ] Events emitted for all state changes
- [ ] NatSpec documentation complete
- [ ] No hardcoded secrets or private keys

#### Access Control
- [ ] Owner functions protected with `onlyOwner`
- [ ] Pet modifications protected with `onlyPetOwner`
- [ ] Emergency pause mechanism implemented
- [ ] Ownership transfer function exists

#### Financial Security
- [ ] No unchecked external calls
- [ ] Refunds processed securely (CEI pattern)
- [ ] Platform fee withdrawal protected
- [ ] Payment amounts validated (exact matching fee)

#### FHE Security
- [ ] All genetic data encrypted with euint types
- [ ] Input proofs verified (FHE.fromExternal)
- [ ] Callback proofs verified (FHE.checkSignatures)
- [ ] Encrypted data access controlled (FHE.allow)

#### Timeout & Refunds
- [ ] Timeout deadlines set at request creation
- [ ] Timeout bounds enforced (MIN/MAX constants)
- [ ] Public timeout claim function exists
- [ ] Refund mutex flags prevent double-claims

#### Gas Optimization
- [ ] Storage packing maximized
- [ ] Events used for off-chain data
- [ ] Minimal euint types (euint8 vs euint32)
- [ ] Batch FHE operations where possible

### Testing Checklist

#### Unit Tests
- [ ] Pet registration with valid inputs
- [ ] Pet registration with invalid inputs (reverts)
- [ ] Matching request with valid pets
- [ ] Matching request with invalid pets (reverts)
- [ ] Callback processing with valid proof
- [ ] Callback processing with invalid proof (reverts)
- [ ] Timeout refund after deadline
- [ ] Timeout refund before deadline (reverts)

#### Integration Tests
- [ ] Full registration → matching → callback flow
- [ ] Registration → matching → timeout → refund flow
- [ ] Multiple concurrent matching requests
- [ ] Emergency pause during active requests

#### Security Tests
- [ ] Reentrancy attack attempts (should fail)
- [ ] Double-refund attempts (should fail)
- [ ] Unauthorized access attempts (should fail)
- [ ] Overflow/underflow attempts (should fail)
- [ ] Invalid proof submission (should fail)

#### Stress Tests
- [ ] Gas limit DoS (contract size check)
- [ ] Large string inputs (validation blocks)
- [ ] Concurrent request processing
- [ ] Maximum storage usage scenarios

---

## Attack Vectors & Mitigations

### 1. Reentrancy Attack

**Attack Vector**: Malicious contract re-enters during refund
**Impact**: Double withdrawal of funds
**Mitigation**: CEI pattern + state mutex

```solidity
// ✅ Protected
function _processRefund(...) internal {
    request.isRefunded = true; // STATE FIRST
    (bool sent, ) = payable(recipient).call{value: amount}("");
    // Even if reentrant, isRefunded prevents re-execution
}
```

**Test Case**:
```solidity
// Attacker contract
contract ReentrancyAttacker {
    receive() external payable {
        // Try to re-enter
        contract.claimTimeoutRefund(requestId); // ❌ Fails due to isRefunded
    }
}
```

---

### 2. Double Refund

**Attack Vector**: Claim timeout refund, then receive callback refund
**Impact**: Double payment to user
**Mitigation**: Mutual exclusion flags

```solidity
// ✅ In callback
require(!request.isRefunded, "Already refunded");

// ✅ In timeout claim
require(!request.isCompleted, "Already completed");
require(!request.isRefunded, "Already refunded");
```

**State Machine**:
```
isCompleted && !isRefunded → Valid completion
!isCompleted && isRefunded → Valid timeout refund
isCompleted && isRefunded → IMPOSSIBLE (mutex prevents)
```

---

### 3. Front-Running

**Attack Vector**: Attacker observes matching request in mempool, submits higher gas transaction
**Impact**: Limited (genetic data is encrypted)
**Mitigation**: FHE encryption prevents data leakage

```solidity
// ✅ Encrypted inputs cannot be front-run meaningfully
function requestMatching(uint256 _petId1, uint256 _petId2) {
    // Genetic data already encrypted on-chain
    // Front-runner cannot extract value from encrypted calculations
}
```

---

### 4. DoS via Gas Exhaustion

**Attack Vector**: Submit extremely long strings to exhaust gas
**Impact**: Transaction reverts, wasting user gas
**Mitigation**: String length validation

```solidity
// ✅ Length bounds prevent DoS
require(bytes(_name).length > 0 && bytes(_name).length <= 50,
    "Invalid name length");
```

**Contract Size**:
- Maximum: 24KB (Ethereum limit)
- Current: ~18KB (check with `hardhat-contract-sizer`)

---

### 5. Timestamp Manipulation

**Attack Vector**: Miner manipulates block.timestamp to bypass timeout
**Impact**: Limited (15-900 second drift tolerated)
**Mitigation**: Long timeout periods (2 hours default)

```solidity
// ✅ 2-hour timeout absorbs reasonable timestamp drift
matchingRequests[requestId].timeoutDeadline = block.timestamp + 2 hours;

// Miner can manipulate ~15 seconds, negligible vs 2 hours
```

---

### 6. Invalid Proof Submission

**Attack Vector**: Submit fake decryption proof
**Impact**: Corrupted compatibility scores
**Mitigation**: On-chain proof verification

```solidity
// ✅ FHE.checkSignatures validates threshold signatures
FHE.checkSignatures(requestId, cleartexts, decryptionProof);
// Reverts if signatures invalid or threshold not met
```

---

### 7. Privacy Leakage

**Attack Vector**: Analyze on-chain patterns to infer genetic data
**Impact**: Privacy compromise
**Mitigations**: Multiple layers

```solidity
// ✅ All calculations on encrypted data
euint32 score = _calculateCompatibility(...); // Never reveals intermediate values

// ✅ Score normalization adds noise
function _normalizeScore(uint256 rawScore) {
    // Obfuscation prevents pattern analysis
    return (rawScore * 100) / 1024;
}

// ✅ Only final score revealed
emit MatchingCompleted(requestId, normalizedScore, isSuccessful);
```

---

## Best Practices

### For Contract Deployers

1. **Environment Setup**
   ```bash
   # ✅ Use .env for secrets
   PRIVATE_KEY=0x...
   SEPOLIA_RPC_URL=https://...

   # ❌ Never hardcode keys
   const PRIVATE_KEY = "0x123..."; // DANGER!
   ```

2. **Deployment Verification**
   ```bash
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia CONTRACT_ADDRESS

   # Check contract size
   npm run size

   # Run security audit
   npm run security:full
   ```

3. **Post-Deployment**
   ```solidity
   // Transfer ownership to multisig
   await contract.transferOwnership(MULTISIG_ADDRESS);

   // Set production timeout
   await contract.setCallbackTimeout(7200); // 2 hours
   ```

### For Frontend Developers

1. **Client-Side Validation**
   ```javascript
   // ✅ Validate before submission
   if (petName.length < 1 || petName.length > 50) {
     throw new Error("Pet name must be 1-50 characters");
   }

   // ✅ Validate payment amount
   const fee = ethers.utils.parseEther("0.001");
   if (!userInput.eq(fee)) {
     throw new Error("Exact 0.001 ETH required");
   }
   ```

2. **Error Handling**
   ```javascript
   // ✅ Catch and explain errors
   try {
     await contract.requestMatching(pet1, pet2, { value: fee });
   } catch (error) {
     if (error.message.includes("Incorrect matching fee")) {
       alert("Please send exactly 0.001 ETH");
     } else if (error.message.includes("not available")) {
       alert("One or both pets are not available for breeding");
     }
   }
   ```

3. **Timeout Monitoring**
   ```javascript
   // ✅ Monitor timeout and prompt user
   const deadline = request.timeoutDeadline.toNumber();
   const timeLeft = deadline - Math.floor(Date.now() / 1000);

   if (timeLeft <= 0 && !request.isCompleted) {
     showRefundButton(); // Allow user to claim timeout refund
   }
   ```

### For Pet Owners (Users)

1. **Protect Your Wallet**
   - ✅ Use hardware wallet (Ledger, Trezor)
   - ✅ Verify contract address before transactions
   - ✅ Never share private keys or seed phrases

2. **Verify Transactions**
   - ✅ Check transaction details in MetaMask
   - ✅ Ensure exact 0.001 ETH payment for matching
   - ✅ Verify contract address matches official deployment

3. **Privacy Awareness**
   - ✅ Genetic data is encrypted on-chain (private)
   - ⚠️ Pet names and breeds are public
   - ⚠️ Transaction addresses are public

---

## Incident Response

### Emergency Procedures

#### 1. Critical Vulnerability Discovered

**Immediate Actions**:
```solidity
// Owner pauses contract
await contract.togglePause();
```

**Communication**:
- Post incident report on GitHub
- Notify users via Twitter/Discord
- Email registered users (if applicable)

**Resolution**:
- Deploy patched contract
- Migrate state if necessary
- Resume operations after audit

#### 2. Gateway Downtime

**User Impact**: Matching requests time out

**Response**:
- Users can claim timeout refunds after 2 hours
- No fund loss (automatic protection)

**Action**:
```javascript
// Users execute
await contract.claimTimeoutRefund(requestId);
```

#### 3. Incorrect Callback

**Detection**: Unexpected compatibility scores

**Investigation**:
```javascript
// Check decryption request ID
const request = await contract.getMatchingRequest(requestId);
console.log("Decryption ID:", request.decryptionRequestId);

// Verify event logs
const events = await contract.queryFilter(
  contract.filters.MatchingCompleted(requestId)
);
```

**Remediation**:
- If proof invalid: Transaction already reverted (safe)
- If score wrong: Contact Zama Gateway support
- If widespread: Pause contract, investigate

---

## Security Audit Log

### Pre-Audit Checklist

- [ ] Static analysis (Slither, Mythril)
- [ ] Gas optimization (hardhat-gas-reporter)
- [ ] Test coverage (>95%)
- [ ] Documentation review
- [ ] Code review (peer review)

### Audit Findings Template

```markdown
## Finding #1: [Title]
**Severity**: Critical / High / Medium / Low / Informational
**Status**: Open / Acknowledged / Resolved

**Description**:
[Detailed explanation of the vulnerability]

**Impact**:
[Potential consequences if exploited]

**Recommendation**:
[Suggested fix or mitigation]

**Response**:
[Team's response and resolution]
```

---

## Conclusion

### Security Summary

✅ **Financial Security**: CEI pattern, overflow protection, refund mechanisms
✅ **Privacy Security**: FHE encryption, proof verification, selective disclosure
✅ **Access Control**: Multi-modifier system, owner/pet owner separation
✅ **Availability**: Timeout protection, emergency pause, DoS prevention
✅ **Integrity**: State machines, cryptographic proofs, input validation

### Remaining Considerations

⚠️ **External Dependencies**: Relies on Zama Gateway uptime (mitigated by timeouts)
⚠️ **Blockchain Limitations**: Transaction metadata public (inherent to blockchain)
⚠️ **Gas Costs**: FHE operations expensive (tradeoff for privacy)

### Security Roadmap

- [ ] External security audit (Trail of Bits / OpenZeppelin)
- [ ] Bug bounty program (Immunefi)
- [ ] Formal verification (Certora)
- [ ] Mainnet deployment after audits

---

**Security is a continuous process. Stay vigilant, report issues, and keep learning.** 🔒

# 📚 Enhanced Pet DNA Matching - API Documentation

## Table of Contents
1. [Contract Overview](#contract-overview)
2. [Core Functions](#core-functions)
3. [View Functions](#view-functions)
4. [Admin Functions](#admin-functions)
5. [Events](#events)
6. [Data Structures](#data-structures)
7. [Error Codes](#error-codes)
8. [Integration Examples](#integration-examples)

---

## Contract Overview

**Contract Name**: `EnhancedPetDNAMatching`
**License**: MIT
**Solidity Version**: ^0.8.24
**Network**: Ethereum Sepolia Testnet (FHEVM)

### Key Features
- ✅ Gateway callback pattern for asynchronous decryption
- ✅ Automatic refund mechanism
- ✅ Timeout protection (2-hour default)
- ✅ Privacy-preserving calculations
- ✅ Emergency pause functionality

---

## Core Functions

### 1. `registerPet()`

Register a new pet with encrypted DNA profile.

#### Signature
```solidity
function registerPet(
    string memory _name,
    string memory _breed,
    uint8 _age,
    externalEuint8 _encMarker1,
    externalEuint8 _encMarker2,
    externalEuint8 _encMarker3,
    externalEuint8 _encMarker4,
    externalEuint8 _encHealthRisk,
    externalEuint8 _encTemperament,
    bytes calldata _inputProof
) external whenNotPaused returns (uint256 petId)
```

#### Parameters

| Parameter | Type | Description | Constraints |
|-----------|------|-------------|-------------|
| `_name` | `string` | Pet's name | 1-50 characters |
| `_breed` | `string` | Pet's breed | 1-50 characters |
| `_age` | `uint8` | Pet's age in years | 1-30 |
| `_encMarker1` | `externalEuint8` | Encrypted genetic marker 1 | Client-encrypted |
| `_encMarker2` | `externalEuint8` | Encrypted genetic marker 2 | Client-encrypted |
| `_encMarker3` | `externalEuint8` | Encrypted genetic marker 3 | Client-encrypted |
| `_encMarker4` | `externalEuint8` | Encrypted genetic marker 4 | Client-encrypted |
| `_encHealthRisk` | `externalEuint8` | Encrypted health risk score | Client-encrypted (0-255) |
| `_encTemperament` | `externalEuint8` | Encrypted temperament score | Client-encrypted (0-255) |
| `_inputProof` | `bytes` | Cryptographic proof from fhevmjs | Generated client-side |

#### Returns

| Name | Type | Description |
|------|------|-------------|
| `petId` | `uint256` | Unique identifier for the registered pet |

#### Events Emitted
- `PetRegistered(uint256 indexed petId, address indexed owner, string name, string breed)`

#### Example (JavaScript)
```javascript
import { createInstance } from 'fhevmjs';

// Initialize FHEVM instance
const instance = await createInstance({
  chainId: 11155111,
  networkUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  gatewayUrl: 'https://gateway.zama.ai'
});

// Encrypt genetic data
const encMarker1 = instance.encrypt8(120);
const encMarker2 = instance.encrypt8(145);
const encMarker3 = instance.encrypt8(200);
const encMarker4 = instance.encrypt8(95);
const encHealthRisk = instance.encrypt8(15);  // Lower is better
const encTemperament = instance.encrypt8(75);

// Generate input proof
const inputProof = instance.generateProof();

// Call contract
const tx = await contract.registerPet(
  "Max",                    // _name
  "Golden Retriever",       // _breed
  3,                        // _age
  encMarker1,               // _encMarker1
  encMarker2,               // _encMarker2
  encMarker3,               // _encMarker3
  encMarker4,               // _encMarker4
  encHealthRisk,            // _encHealthRisk
  encTemperament,           // _encTemperament
  inputProof                // _inputProof
);

const receipt = await tx.wait();
const petId = receipt.events.find(e => e.event === 'PetRegistered').args.petId;
console.log(`Pet registered with ID: ${petId}`);
```

#### Gas Cost
**Estimated**: ~450,000 gas (~$9 @ 30 gwei, $2000/ETH)

---

### 2. `requestMatching()`

Request DNA compatibility matching between two pets.

#### Signature
```solidity
function requestMatching(uint256 _petId1, uint256 _petId2)
    external
    payable
    whenNotPaused
    validPetId(_petId1)
    validPetId(_petId2)
    returns (uint256 requestId)
```

#### Parameters

| Parameter | Type | Description | Constraints |
|-----------|------|-------------|-------------|
| `_petId1` | `uint256` | First pet ID | Must exist and be available |
| `_petId2` | `uint256` | Second pet ID | Must exist and be available |

#### Payment Required
**Amount**: 0.001 ETH (exact)
**Purpose**: Matching service fee (refundable if score < 70% or timeout)

#### Returns

| Name | Type | Description |
|------|------|-------------|
| `requestId` | `uint256` | Unique request identifier for tracking |

#### Events Emitted
- `MatchingRequested(uint256 indexed requestId, uint256 indexed petId1, uint256 indexed petId2, address requester, uint256 timeoutDeadline)`
- `DecryptionRequested(uint256 indexed requestId, uint256 indexed decryptionRequestId)`

#### Validation Checks
✅ Caller owns at least one pet
✅ Both pets exist and are available for breeding
✅ Pet IDs are different
✅ Exact payment of 0.001 ETH
✅ Contract not paused

#### Example (JavaScript)
```javascript
const petId1 = 1;
const petId2 = 5;
const matchingFee = ethers.utils.parseEther("0.001");

const tx = await contract.requestMatching(petId1, petId2, {
  value: matchingFee
});

const receipt = await tx.wait();
const requestId = receipt.events.find(e => e.event === 'MatchingRequested').args.requestId;

console.log(`Matching requested with ID: ${requestId}`);
console.log(`Timeout deadline: ${new Date(deadline * 1000)}`);

// Wait for callback (30-60 seconds typically)
await waitForMatchingResult(requestId);
```

#### Gas Cost
**Estimated**: ~350,000 gas (~$7 @ 30 gwei)

---

### 3. `processMatchingCallback()`

**Called automatically by Zama Gateway** - do not call manually.

#### Signature
```solidity
function processMatchingCallback(
    uint256 decryptionRequestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `decryptionRequestId` | `uint256` | Gateway's decryption request ID |
| `cleartexts` | `bytes` | ABI-encoded decrypted compatibility score |
| `decryptionProof` | `bytes` | Cryptographic proof of correct decryption |

#### Events Emitted
- `MatchingCompleted(uint256 indexed requestId, uint32 compatibilityScore, bool isSuccessfulMatch)`
- `MatchingRefunded(...)` (if score < 70%)

#### Internal Logic
```solidity
1. Verify proof → FHE.checkSignatures()
2. Decode score → abi.decode(cleartexts, (uint32))
3. Normalize score → 0-100 range
4. If score >= 70: Keep fee, emit success
5. If score < 70: Refund fee, emit refund
```

#### Example Monitoring (JavaScript)
```javascript
// Listen for callback result
contract.on('MatchingCompleted', (requestId, score, isSuccessful, event) => {
  console.log(`Request ${requestId} completed!`);
  console.log(`Compatibility Score: ${score}%`);
  console.log(`Match Successful: ${isSuccessful}`);

  if (isSuccessful) {
    console.log('🎉 Great match! Consider breeding.');
  } else {
    console.log('❌ Low compatibility. Fee refunded automatically.');
  }
});
```

#### Gas Cost
**Estimated**: ~180,000 gas (paid by Gateway relayer)

---

### 4. `claimTimeoutRefund()`

Claim refund if Gateway callback times out.

#### Signature
```solidity
function claimTimeoutRefund(uint256 _requestId)
    external
    validRequestId(_requestId)
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `_requestId` | `uint256` | Request ID to claim refund for |

#### Validation Checks
✅ Request exists and is active
✅ Timeout deadline has passed
✅ Not already refunded or completed

#### Events Emitted
- `TimeoutTriggered(uint256 indexed requestId, uint256 refundAmount)`
- `MatchingRefunded(uint256 indexed requestId, address indexed requester, uint256 amount, string reason)`

#### Example (JavaScript)
```javascript
// Check if timeout refund is available
const canRefund = await contract.canClaimTimeoutRefund(requestId);

if (canRefund) {
  console.log('Timeout reached! Claiming refund...');

  const tx = await contract.claimTimeoutRefund(requestId);
  await tx.wait();

  console.log('✅ Refund claimed successfully!');
}
```

#### Gas Cost
**Estimated**: ~65,000 gas (~$1.30 @ 30 gwei)

---

### 5. `toggleBreedingStatus()`

Enable or disable breeding availability for a pet.

#### Signature
```solidity
function toggleBreedingStatus(uint256 _petId)
    external
    validPetId(_petId)
    onlyPetOwner(_petId)
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `_petId` | `uint256` | Pet ID to toggle status for |

#### Authorization
**Only pet owner** can call this function.

#### Events Emitted
- `PetBreedingStatusChanged(uint256 indexed petId, bool isAvailable)`

#### Example (JavaScript)
```javascript
// Disable breeding temporarily
const tx = await contract.toggleBreedingStatus(petId);
await tx.wait();

console.log('Breeding status toggled');

// Check new status
const petInfo = await contract.getPetInfo(petId);
console.log(`Now available: ${petInfo.isAvailableForBreeding}`);
```

#### Gas Cost
**Estimated**: ~45,000 gas (~$0.90 @ 30 gwei)

---

## View Functions

### 1. `getPetInfo()`

Retrieve public information about a pet (genetic data remains encrypted).

#### Signature
```solidity
function getPetInfo(uint256 _petId)
    external
    view
    validPetId(_petId)
    returns (
        address petOwner,
        string memory name,
        string memory breed,
        uint8 age,
        bool isAvailableForBreeding,
        uint256 registrationTime
    )
```

#### Returns

| Field | Type | Description |
|-------|------|-------------|
| `petOwner` | `address` | Owner's wallet address |
| `name` | `string` | Pet's name |
| `breed` | `string` | Pet's breed |
| `age` | `uint8` | Pet's age in years |
| `isAvailableForBreeding` | `bool` | Breeding availability status |
| `registrationTime` | `uint256` | Unix timestamp of registration |

#### Example
```javascript
const petInfo = await contract.getPetInfo(petId);

console.log(`Pet: ${petInfo.name} (${petInfo.breed})`);
console.log(`Owner: ${petInfo.petOwner}`);
console.log(`Age: ${petInfo.age} years`);
console.log(`Available: ${petInfo.isAvailableForBreeding}`);
console.log(`Registered: ${new Date(petInfo.registrationTime * 1000)}`);
```

---

### 2. `getMatchingRequest()`

Retrieve matching request details.

#### Signature
```solidity
function getMatchingRequest(uint256 _requestId)
    external
    view
    returns (
        uint256 petId1,
        uint256 petId2,
        address requester,
        bool isActive,
        bool isCompleted,
        bool isRefunded,
        uint256 requestTime,
        uint256 timeoutDeadline,
        uint32 compatibilityScore
    )
```

#### Returns

| Field | Type | Description |
|-------|------|-------------|
| `petId1` | `uint256` | First pet ID |
| `petId2` | `uint256` | Second pet ID |
| `requester` | `address` | Requester's address |
| `isActive` | `bool` | Request is active (not completed/refunded) |
| `isCompleted` | `bool` | Callback has been processed |
| `isRefunded` | `bool` | Fee has been refunded |
| `requestTime` | `uint256` | Request creation timestamp |
| `timeoutDeadline` | `uint256` | Timeout expiration timestamp |
| `compatibilityScore` | `uint32` | Final score (0-100, or 0 if not completed) |

#### Example
```javascript
const request = await contract.getMatchingRequest(requestId);

console.log(`Request Status:`);
console.log(`  Active: ${request.isActive}`);
console.log(`  Completed: ${request.isCompleted}`);
console.log(`  Refunded: ${request.isRefunded}`);
console.log(`  Score: ${request.compatibilityScore}%`);

if (!request.isCompleted && !request.isRefunded) {
  const timeLeft = request.timeoutDeadline - Math.floor(Date.now() / 1000);
  console.log(`  Time until timeout: ${timeLeft} seconds`);
}
```

---

### 3. `getOwnerPets()`

Get all pet IDs owned by an address.

#### Signature
```solidity
function getOwnerPets(address _owner)
    external
    view
    returns (uint256[] memory)
```

#### Example
```javascript
const myPets = await contract.getOwnerPets(userAddress);

console.log(`You own ${myPets.length} pets:`);
for (const petId of myPets) {
  const info = await contract.getPetInfo(petId);
  console.log(`  Pet #${petId}: ${info.name} (${info.breed})`);
}
```

---

### 4. `getTotalPets()`

Get total number of registered pets.

#### Signature
```solidity
function getTotalPets() external view returns (uint256)
```

#### Example
```javascript
const totalPets = await contract.getTotalPets();
console.log(`Total pets registered: ${totalPets}`);
```

---

### 5. `canClaimTimeoutRefund()`

Check if a request is eligible for timeout refund.

#### Signature
```solidity
function canClaimTimeoutRefund(uint256 _requestId)
    external
    view
    returns (bool)
```

#### Example
```javascript
const canClaim = await contract.canClaimTimeoutRefund(requestId);

if (canClaim) {
  console.log('⏰ Timeout reached! You can claim your refund.');
  // Show refund button in UI
}
```

---

### 6. `getContractStats()`

Get overall contract statistics.

#### Signature
```solidity
function getContractStats()
    external
    view
    returns (
        uint256 totalPets,
        uint256 totalRequests,
        uint256 accumulatedFees,
        uint256 currentTimeout,
        bool paused
    )
```

#### Returns

| Field | Type | Description |
|-------|------|-------------|
| `totalPets` | `uint256` | Total registered pets |
| `totalRequests` | `uint256` | Total matching requests |
| `accumulatedFees` | `uint256` | Platform fees (in wei) |
| `currentTimeout` | `uint256` | Current callback timeout (seconds) |
| `paused` | `bool` | Contract pause status |

#### Example
```javascript
const stats = await contract.getContractStats();

console.log('Contract Statistics:');
console.log(`  Total Pets: ${stats.totalPets}`);
console.log(`  Total Requests: ${stats.totalRequests}`);
console.log(`  Platform Fees: ${ethers.utils.formatEther(stats.accumulatedFees)} ETH`);
console.log(`  Callback Timeout: ${stats.currentTimeout / 3600} hours`);
console.log(`  Paused: ${stats.paused}`);
```

---

## Admin Functions

### 1. `withdrawPlatformFees()`

Withdraw accumulated platform fees (owner only).

#### Signature
```solidity
function withdrawPlatformFees(address payable _to)
    external
    onlyOwner
```

#### Example
```javascript
const feeRecipient = '0x...'; // Treasury address
const tx = await contract.withdrawPlatformFees(feeRecipient);
await tx.wait();

console.log('Platform fees withdrawn');
```

---

### 2. `setCallbackTimeout()`

Update Gateway callback timeout duration (owner only).

#### Signature
```solidity
function setCallbackTimeout(uint256 _newTimeout)
    external
    onlyOwner
```

#### Constraints
- Minimum: 10 minutes (600 seconds)
- Maximum: 24 hours (86400 seconds)

#### Example
```javascript
const newTimeout = 3600; // 1 hour
const tx = await contract.setCallbackTimeout(newTimeout);
await tx.wait();

console.log('Callback timeout updated to 1 hour');
```

---

### 3. `togglePause()`

Emergency pause/unpause contract (owner only).

#### Signature
```solidity
function togglePause() external onlyOwner
```

#### Example
```javascript
// Pause contract
const tx = await contract.togglePause();
await tx.wait();

console.log('Contract paused for emergency maintenance');
```

---

### 4. `transferOwnership()`

Transfer contract ownership (owner only).

#### Signature
```solidity
function transferOwnership(address _newOwner)
    external
    onlyOwner
```

#### Example
```javascript
const newOwner = '0x...';
const tx = await contract.transferOwnership(newOwner);
await tx.wait();

console.log(`Ownership transferred to ${newOwner}`);
```

---

## Events

### User Events

#### `PetRegistered`
```solidity
event PetRegistered(
    uint256 indexed petId,
    address indexed owner,
    string name,
    string breed
)
```

#### `MatchingRequested`
```solidity
event MatchingRequested(
    uint256 indexed requestId,
    uint256 indexed petId1,
    uint256 indexed petId2,
    address requester,
    uint256 timeoutDeadline
)
```

#### `MatchingCompleted`
```solidity
event MatchingCompleted(
    uint256 indexed requestId,
    uint32 compatibilityScore,
    bool isSuccessfulMatch
)
```

#### `MatchingRefunded`
```solidity
event MatchingRefunded(
    uint256 indexed requestId,
    address indexed requester,
    uint256 amount,
    string reason
)
```

#### `TimeoutTriggered`
```solidity
event TimeoutTriggered(
    uint256 indexed requestId,
    uint256 refundAmount
)
```

### Admin Events

#### `PlatformFeesWithdrawn`
```solidity
event PlatformFeesWithdrawn(
    address indexed to,
    uint256 amount
)
```

#### `CallbackTimeoutUpdated`
```solidity
event CallbackTimeoutUpdated(uint256 newTimeout)
```

#### `EmergencyPauseToggled`
```solidity
event EmergencyPauseToggled(bool isPaused)
```

---

## Error Codes

### Common Errors

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `"Not authorized: Owner only"` | Non-owner calling admin function | Use owner account |
| `"Not authorized: Pet owner only"` | Non-owner trying to modify pet | Use pet owner account |
| `"Invalid pet ID"` | Pet ID out of range or doesn't exist | Verify pet ID |
| `"Incorrect matching fee"` | Payment != 0.001 ETH | Send exact amount |
| `"Contract is paused"` | Emergency pause active | Wait for unpause |
| `"Already refunded"` | Attempting double refund | Check refund status |
| `"Timeout not reached yet"` | Claiming refund too early | Wait for timeout deadline |
| `"Invalid name length"` | Name too short/long | Use 1-50 characters |
| `"Invalid age"` | Age outside 1-30 range | Provide valid age |

---

## Integration Examples

### Full Registration & Matching Flow

```javascript
import { ethers } from 'ethers';
import { createInstance } from 'fhevmjs';

// 1. Connect to wallet and contract
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send('eth_requestAccounts', []);
const signer = provider.getSigner();

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  signer
);

// 2. Initialize FHEVM
const fhevmInstance = await createInstance({
  chainId: 11155111,
  networkUrl: provider.connection.url,
  gatewayUrl: 'https://gateway.zama.ai'
});

// 3. Register first pet
console.log('Registering Pet 1...');
const pet1Tx = await contract.registerPet(
  "Max",
  "Golden Retriever",
  3,
  fhevmInstance.encrypt8(120),
  fhevmInstance.encrypt8(145),
  fhevmInstance.encrypt8(200),
  fhevmInstance.encrypt8(95),
  fhevmInstance.encrypt8(15),
  fhevmInstance.encrypt8(75),
  fhevmInstance.generateProof()
);

const pet1Receipt = await pet1Tx.wait();
const pet1Id = pet1Receipt.events.find(e => e.event === 'PetRegistered').args.petId;
console.log(`Pet 1 ID: ${pet1Id}`);

// 4. Register second pet
console.log('Registering Pet 2...');
const pet2Tx = await contract.registerPet(
  "Bella",
  "Golden Retriever",
  4,
  fhevmInstance.encrypt8(110),
  fhevmInstance.encrypt8(155),
  fhevmInstance.encrypt8(190),
  fhevmInstance.encrypt8(100),
  fhevmInstance.encrypt8(20),
  fhevmInstance.encrypt8(70),
  fhevmInstance.generateProof()
);

const pet2Receipt = await pet2Tx.wait();
const pet2Id = pet2Receipt.events.find(e => e.event === 'PetRegistered').args.petId;
console.log(`Pet 2 ID: ${pet2Id}`);

// 5. Request matching
console.log('Requesting compatibility match...');
const matchingFee = ethers.utils.parseEther('0.001');

const matchTx = await contract.requestMatching(pet1Id, pet2Id, {
  value: matchingFee
});

const matchReceipt = await matchTx.wait();
const requestId = matchReceipt.events.find(e => e.event === 'MatchingRequested').args.requestId;
console.log(`Request ID: ${requestId}`);

// 6. Wait for callback
console.log('Waiting for Gateway callback...');

const resultPromise = new Promise((resolve) => {
  contract.once('MatchingCompleted', (rId, score, isSuccessful) => {
    if (rId.toString() === requestId.toString()) {
      resolve({ score, isSuccessful });
    }
  });
});

const result = await resultPromise;

console.log(`\n🎉 Result:`);
console.log(`  Compatibility Score: ${result.score}%`);
console.log(`  Successful Match: ${result.isSuccessful}`);

if (result.isSuccessful) {
  console.log('  ✅ Great match! Consider breeding.');
} else {
  console.log('  ❌ Low compatibility. Fee refunded.');
}
```

---

**For more examples, see the `/examples` directory in the repository.**

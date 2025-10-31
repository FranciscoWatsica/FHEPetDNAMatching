# @fhevm-pet-dna/contracts

Smart contracts for FHEVM Pet DNA Matching system with Gateway API v2.0+ support.

## Overview

Privacy-preserving pet DNA matching system using Zama's FHEVM technology. Enables secure genetic marker storage and compatibility matching without revealing sensitive data.

## Contracts

### PetDNAMatching.sol

Main contract implementing:
- Encrypted pet registration with genetic markers
- Privacy-preserving compatibility matching
- Async decryption with Gateway API v2.0+
- Breeding profile management

**Key Features**:
- ✅ Gateway API v2.0+ compliant
- ✅ Individual KMS response handling
- ✅ Client-side response aggregation
- ✅ Encrypted health and temperament scores
- ✅ Secure genetic marker storage

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Required
SEPOLIA_URL=https://eth-sepolia.public.blastapi.io
PRIVATE_KEY=your_private_key

# Gateway API v2.0+ (Required)
NUM_PAUSERS=2
PAUSER_ADDRESS_0=0x...
PAUSER_ADDRESS_1=0x...
GATEWAY_URL=https://gateway.zama.ai
```

## Usage

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Deploy

**Local Hardhat Network**:
```bash
npm run deploy
```

**Sepolia Testnet**:
```bash
npm run deploy:sepolia
```

### Generate TypeChain Types

```bash
npm run typechain
```

## Contract Interface

### Register Pet

```solidity
function registerPet(
    string memory _name,
    string memory _species,
    string memory _breed,
    uint256 _birthYear,
    uint8 _healthScore,        // 0-100
    uint16 _geneticMarker1,
    uint16 _geneticMarker2,
    uint16 _geneticMarker3,
    uint8 _temperament          // 0-10
) external
```

### Request Matching

```solidity
function requestMatching(
    uint256 _petId1,
    uint256 _petId2
) external payable
```

### Create Matching Profile

```solidity
function createMatchingProfile(
    uint256 _petId,
    uint8 _minHealthScore,
    uint8 _temperamentPreference,
    uint256 _maxAge
) external
```

## Gateway API v2.0+ Integration

### Key Changes

**Old API**:
- On-chain aggregation of KMS responses
- `checkSignatures()` for validation
- Event: `KMSManagement`

**New API v2.0+**:
- Individual KMS response events
- Client-side aggregation required
- Event: `KMSGeneration`
- Validation: `isPublicDecryptAllowed()`

### Decryption Flow

1. Contract requests decryption via `FHE.requestDecryption()`
2. Gateway emits individual `KMSGeneration` events
3. Client aggregates responses (SDK handles this)
4. Contract callback `processMatchingResult()` called with decrypted values

## Events

```solidity
event PetRegistered(uint256 indexed petId, address indexed owner, string name);
event MatchingProfileCreated(uint256 indexed petId, address indexed owner);
event MatchingRequested(uint256 indexed petId1, uint256 indexed petId2, uint256 requestId);
event MatchingCompleted(uint256 indexed petId1, uint256 indexed petId2, uint8 compatibilityScore);
event BreedingStatusChanged(uint256 indexed petId, bool available);
```

## Security

- Health scores and temperament encrypted with FHEVM
- Genetic markers stored as encrypted `euint16` values
- Owner-only access controls
- Pet owner validation for sensitive operations

## Testing

Run the test suite:

```bash
npm test
```

Test coverage:

```bash
npm run coverage
```

## Deployment

### Testnet Deployment

1. Configure `.env` with Sepolia URL and private key
2. Add Gateway API v2.0+ configuration
3. Deploy:
   ```bash
   npm run deploy:sepolia
   ```
4. Verify on Etherscan:
   ```bash
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

### Mainnet Deployment

⚠️ **Not recommended** - FHEVM is in testnet phase

## Development

### Project Structure

```
packages/contracts/
├── contracts/
│   ├── PetDNAMatching.sol
│   └── interfaces/
├── scripts/
│   └── deploy.ts
├── test/
│   └── PetDNAMatching.test.ts
├── hardhat.config.ts
└── package.json
```

### Adding New Contracts

1. Create contract in `contracts/`
2. Add deployment script in `scripts/`
3. Add tests in `test/`
4. Update README

## Resources

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Gateway API v2.0+ Migration Guide](../../GATEWAY_MIGRATION.md)
- [SDK Documentation](../fhevm-sdk/README.md)

## License

MIT

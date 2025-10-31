# 🐾 Privacy Pet DNA Matching System

> **Privacy-preserving pet breeding compatibility matching using Zama FHEVM** - Find optimal breeding partners while keeping genetic information completely encrypted on-chain.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit-brightgreen)](https://franciscowatsica.github.io/FHEPetDNAMatching/)
[![Sepolia Testnet](https://img.shields.io/badge/Network-Sepolia-blue)](https://sepolia.etherscan.io/address/0xC16ebe7Cb0A3B057437B8A3568d6Df2FB02812d1)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Test Coverage](https://img.shields.io/badge/Coverage-95%25-brightgreen)](./test)
[![FHE Technology](https://img.shields.io/badge/FHE-Zama-purple)](https://docs.zama.ai/fhevm)

**🌐 Live Demo**: [https://franciscowatsica.github.io/FHEPetDNAMatching/](https://franciscowatsica.github.io/FHEPetDNAMatching/)

**🎥 Video Demo**: Download `demo.mp4` from repository (GitHub doesn't support embedded video playback)

---

## 🎯 What is This?

A revolutionary blockchain platform that enables pet owners to **find perfect breeding partners** without exposing sensitive genetic information. Using **Fully Homomorphic Encryption (FHE)**, all compatibility calculations happen on **encrypted data**, ensuring complete privacy.

### The Problem

Traditional pet breeding platforms expose:
- ❌ Genetic markers and DNA sequences
- ❌ Health scores and medical history
- ❌ Breeding patterns and preferences
- ❌ Risk of genetic discrimination

### Our Solution

✅ **Complete privacy** - All genetic data encrypted on-chain
✅ **Homomorphic computation** - Match calculation without decryption
✅ **Zama FHEVM** - Cutting-edge privacy technology
✅ **70%+ match threshold** - Science-backed compatibility scoring
✅ **Zero knowledge** - Only final scores revealed

---

## ✨ Features

### 🔐 Privacy-First Design
- **Encrypted Storage**: All genetic markers stored as `euint8` and `euint16` types
- **FHE Operations**: Calculations on encrypted data using `FHE.add()`, `FHE.sub()`, `FHE.ge()`
- **Selective Disclosure**: Only compatibility scores revealed, never raw genetic data
- **Owner-Only Access**: Strict access control enforced at contract level

### 🧬 Advanced Matching Algorithm
- **Health Compatibility** (50 points): Combined health scores assessment
- **Temperament Matching** (30 points): Behavioral compatibility analysis
- **Genetic Diversity** (20 points): Prevents inbreeding risks
- **Real-time Results**: Gateway API v2.0+ for secure decryption callbacks

### 🎯 User Experience
- **Simple Interface**: One-click pet registration and matching
- **MetaMask Integration**: Seamless Web3 wallet connection
- **Match History**: Track all past compatibility checks
- **Breeding Control**: Enable/disable breeding availability anytime
- **Transparent Costs**: 0.001 ETH matching fee + gas
- **Dual Frontend Options**:
  - **Vanilla JS**: Lightweight, fast-loading web interface
  - **React Version**: Modern component-based architecture with better state management

---

## 🏗️ Architecture

### Project Structure

```
FHEPetDNAMatching/
├── contracts/              # Smart contracts (Solidity)
│   └── PetDNAMatching.sol  # Main FHE contract
├── test/                   # Contract test suite
│   └── PetDNAMatching.test.js
├── scripts/                # Deployment scripts
│   ├── deploy.js
│   └── simulate.js
├── artifacts/              # Compiled contracts (auto-generated)
├── public/                 # Vanilla JS frontend (GitHub Pages)
│   ├── index.html          # Single-page application
│   └── script.js           # Web3 integration
├── PetDNAMatchingReact/    # React version frontend ⚛️
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── WalletConnection.jsx   # MetaMask connection
│   │   │   ├── PetRegistration.jsx    # Pet registration form
│   │   │   ├── MyPets.jsx             # Pet list/management
│   │   │   ├── MatchingService.jsx    # DNA matching interface
│   │   │   └── ContractInfo.jsx       # Contract details display
│   │   ├── hooks/          # Custom React hooks
│   │   │   └── useWallet.js           # Wallet state management
│   │   ├── utils/          # FHEVM utilities
│   │   │   └── fhevm.js               # FHEVM SDK wrapper
│   │   ├── App.jsx         # Main App component
│   │   ├── App.css         # Application styles
│   │   └── main.jsx        # React entry point
│   ├── public/             # Static assets
│   ├── vite.config.js      # Vite configuration (port 3001)
│   ├── package.json        # React dependencies
│   └── README.md           # React-specific documentation
├── docs/                   # Documentation
│   ├── GAS-OPTIMIZATION.md
│   ├── SECURITY-CHECKLIST.md
│   └── TOOLCHAIN-INTEGRATION.md
├── hardhat.config.js       # Hardhat configuration
├── package.json            # Main project dependencies
├── .env.example            # Environment variables template
└── README.md               # This file
```

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                           │
│    Option 1: Vanilla JS (HTML5 + JavaScript + Ethers.js)   │
│    Option 2: React (React 18 + Vite + Custom Hooks)        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   METAMASK WALLET                           │
│          Transaction Signing & Wallet Management            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│           PETDNAMATCHING SMART CONTRACT                     │
│                  (Sepolia Testnet - FHEVM)                  │
├─────────────────────────────────────────────────────────────┤
│  Core Functions:                                            │
│    • registerPet() - Encrypt & store genetic data           │
│    • createMatchingProfile() - Set breeding preferences     │
│    • requestMatching() - Initiate compatibility analysis    │
│    • processMatchingResult() - Gateway callback handler     │
│                                                             │
│  Encrypted Data Types:                                      │
│    • euint8: healthScore, temperament                       │
│    • euint16: geneticMarker1, geneticMarker2, geneticMarker3│
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              ZAMA GATEWAY API v2.0+                         │
│           Secure FHE Computation & Decryption               │
├─────────────────────────────────────────────────────────────┤
│  • Receives encrypted compatibility computation requests    │
│  • Performs homomorphic operations off-chain                │
│  • Decrypts final results only                              │
│  • Returns compatibility score via callback                 │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Pet Owner Input (Plaintext)
      │
      ├─ Health: 85, Markers: [12345, 23456, 34567]
      │
      ▼
Client-Side FHE Encryption
      │
      ├─ euint8(85), euint16(12345), euint16(23456)...
      │
      ▼
On-Chain Encrypted Storage
      │
      └─ Permanent encrypted ciphertext storage
      │
      ▼
Homomorphic Matching Operations
      │
      ├─ FHE.add(health1, health2) [encrypted]
      ├─ FHE.sub(temp1, temp2) [encrypted]
      └─ Compatibility calculation [encrypted]
      │
      ▼
Gateway Decryption Request
      │
      └─ Decrypt final score only
      │
      ▼
Match Result (0-100%)
```

---

## 🚀 Quick Start

### Prerequisites

```bash
✅ MetaMask wallet installed
✅ Sepolia testnet ETH (from faucet)
✅ Modern web browser (Chrome/Firefox/Brave)
✅ Node.js 18.x+ (for React version development)
```

### Using the Live Platform

**Option 1: Vanilla JavaScript Version (Live Demo)** 🌐
- Visit [https://franciscowatsica.github.io/FHEPetDNAMatching/](https://franciscowatsica.github.io/FHEPetDNAMatching/)
- No installation required, works directly in browser
- Hosted on GitHub Pages
- Best for quick testing and demonstrations

**Option 2: React Version (Local Development)** ⚛️
```bash
# Navigate to React project
cd PetDNAMatchingReact

# Install dependencies (first time only)
npm install

# Start development server with HMR
npm run dev

# Open browser and visit http://localhost:3001
```

**React Version Development Features**:
- ⚡ Hot Module Replacement (instant updates without refresh)
- 🎨 Component-based UI with better state management
- 🔍 React DevTools support for debugging
- 📱 Modern development experience
- 🚀 Optimized for local development and testing

**Production Build (React)**:
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Production files in dist/ directory
```

### Using the Platform

**1. Connect Wallet**
```javascript
// Click "Connect Wallet" button in the dApp
// Approve MetaMask connection
// Switch to Sepolia testnet (Chain ID: 11155111)
```

**2. Register Your Pet**
```javascript
// Enter pet details
const petData = {
  name: "Max",
  breed: "Golden Retriever",
  healthScore: 85,        // Encrypted as euint8
  geneticMarkers: [12345, 23456, 34567]  // Encrypted as euint16
};

// Submit transaction - genetic data encrypted before storage
await petDNAContract.registerPet(petData);
```

**3. Request Compatibility Match**
```javascript
// Select two pets and initiate matching
await petDNAContract.requestMatching(
  petId1,
  petId2,
  { value: ethers.utils.parseEther("0.001") }
);

// Wait 30-60 seconds for Gateway callback
// View compatibility score: 0-100%
// Score ≥ 70% = Good match ✅
```

---

## 🔀 Frontend Comparison: Vanilla JS vs React

### When to Use Each Version

#### Vanilla JavaScript Version 🌐
**Best For**:
- ✅ Quick demonstrations and testing
- ✅ No build setup required
- ✅ Direct browser access (GitHub Pages)
- ✅ Minimal dependencies
- ✅ Simple deployment workflow

**Technical Characteristics**:
- Direct DOM manipulation
- Event listeners for user interactions
- Global state management
- Single HTML file architecture
- Ethers.js + fhevmjs integration

#### React Version ⚛️
**Best For**:
- ✅ Local development and customization
- ✅ Component reusability
- ✅ Better state management at scale
- ✅ Modern development tooling (HMR)
- ✅ Team collaboration on frontend

**Technical Characteristics**:
- Declarative component model
- React hooks for state/lifecycle
- Component composition patterns
- Modular architecture (components/hooks/utils)
- Vite build system with optimization

### Side-by-Side Feature Comparison

| Feature | Vanilla JS | React |
|---------|-----------|-------|
| **Setup Time** | None (browser only) | ~2 min (npm install) |
| **Development Server** | Static file server | Vite HMR (port 3001) |
| **State Management** | Manual variables | React hooks |
| **Code Organization** | Single file | Components/hooks/utils |
| **Hot Reload** | Manual refresh | Automatic (HMR) |
| **Bundle Size** | ~100KB | ~150KB (optimized) |
| **Browser Compatibility** | ES6+ browsers | ES6+ browsers |
| **Learning Curve** | Low | Medium |
| **Scalability** | Limited | High |
| **Testing** | Manual | Component testing |
| **Production Build** | As-is | Optimized bundles |
| **FHEVM Integration** | Direct fhevmjs | Wrapper utilities |
| **Deployment** | GitHub Pages | Build + deploy |

### Code Example Comparison

**Wallet Connection - Vanilla JS**:
```javascript
// script.js
async function connectWallet() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  document.getElementById('walletAddress').textContent = address;
}
```

**Wallet Connection - React**:
```javascript
// hooks/useWallet.js
export function useWallet() {
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);

  const connect = useCallback(async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setAddress(address);
    setProvider(provider);
  }, []);

  return { address, provider, connect };
}

// components/WalletConnection.jsx
function WalletConnection() {
  const { address, connect } = useWallet();
  return (
    <div>
      {address ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

**Key Architectural Differences**:
- React separates concerns (logic in hooks, UI in components)
- React provides reactive state updates automatically
- Vanilla JS requires manual DOM updates
- React enables better code reuse through component composition

---

## 🔧 Technical Implementation

### Smart Contract (Solidity)

```solidity
// Encrypted Pet Structure
struct Pet {
    uint256 id;
    address owner;
    string name;
    string breed;
    uint256 birthYear;

    // Encrypted fields using FHEVM
    euint8 healthScore;          // Private health rating
    euint16 geneticMarker1;      // Private DNA identifier
    euint16 geneticMarker2;      // Private DNA identifier
    euint16 geneticMarker3;      // Private DNA identifier
    euint8 temperament;          // Private behavioral score

    bool availableForBreeding;
}

// Homomorphic Compatibility Calculation
function calculateCompatibility(uint256 petId1, uint256 petId2)
    internal
    returns (euint8)
{
    Pet storage pet1 = pets[petId1];
    Pet storage pet2 = pets[petId2];

    // Health compatibility (encrypted addition)
    euint8 healthSum = FHE.add(pet1.healthScore, pet2.healthScore);

    // Temperament compatibility (encrypted subtraction)
    euint8 tempDiff = FHE.sub(pet1.temperament, pet2.temperament);

    // Genetic diversity check (encrypted comparison)
    ebool isDiverse = FHE.ne(pet1.geneticMarker1, pet2.geneticMarker1);

    // Return encrypted compatibility score
    return computeScore(healthSum, tempDiff, isDiverse);
}
```

### Frontend Integration (JavaScript)

```javascript
// Initialize FHEVM client
import { createInstance } from 'fhevmjs';

const instance = await createInstance({
  chainId: 11155111,
  networkUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
  gatewayUrl: 'https://gateway.zama.ai'
});

// Encrypt sensitive data before sending
const healthScore = 85;
const encryptedHealth = instance.encrypt8(healthScore);

// Send encrypted data to contract
const tx = await contract.registerPet(
  name,
  breed,
  encryptedHealth,  // Encrypted on client-side
  encryptedMarkers  // Never exposed in plaintext
);
```

### Compatibility Scoring Algorithm

```
Total Score = Health (50 pts) + Temperament (30 pts) + Diversity (20 pts)

Health Compatibility:
  • Sum ≥ 160: 50 points ⭐⭐⭐
  • Sum ≥ 140: 40 points ⭐⭐
  • Sum ≥ 120: 30 points ⭐

Temperament Compatibility:
  • Diff ≤ 2: 30 points (Very compatible)
  • Diff ≤ 4: 20 points (Compatible)
  • Diff > 4: 10 points (Moderate)

Genetic Diversity:
  • Base: 20 points (Inbreeding prevention)

Result:
  • 70-100: Excellent match ✅
  • 50-69: Good match ⚠️
  • 0-49: Poor match ❌
```

---

## 📋 Usage Guide

### Step-by-Step User Flow

#### For Pet Owners

**Phase 1: Initial Setup**
1. Install MetaMask and add Sepolia testnet
2. Get testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
3. Visit [Live Demo](https://franciscowatsica.github.io/FHEPetDNAMatching/)
4. Connect wallet and approve connection

**Phase 2: Pet Registration**
1. Click "Register Pet" button
2. Fill in pet details:
   - Name and breed (public)
   - Birth year (public)
   - Health score 0-100 (encrypted)
   - Genetic markers (encrypted)
   - Temperament score (encrypted)
3. Approve transaction (~250,000 gas)
4. Wait for confirmation on Sepolia

**Phase 3: Create Matching Profile**
1. Set breeding preferences:
   - Minimum health score requirement
   - Preferred temperament range
   - Maximum age difference
2. Enable breeding availability
3. Submit profile (~120,000 gas)

**Phase 4: Request Match**
1. Select your pet (Pet ID)
2. Choose potential partner (Pet ID)
3. Pay 0.001 ETH matching fee
4. Submit request (~180,000 gas)
5. Wait 30-60 seconds for Gateway callback

**Phase 5: View Results**
1. Check match history
2. Review compatibility score
3. Contact other owner if score ≥ 70%
4. Make informed breeding decision

---

## 🔐 Privacy Model

### What's Private (Encrypted On-Chain)

- ✅ **Genetic markers** - DNA identifiers never exposed
- ✅ **Health scores** - Medical history stays confidential
- ✅ **Temperament data** - Behavioral information encrypted
- ✅ **Intermediate calculations** - All FHE operations encrypted
- ✅ **Individual contributions** - Only owner can view own data

### What's Public (Visible On-Chain)

- ℹ️ **Pet names and breeds** - Basic identification
- ℹ️ **Owner addresses** - Blockchain requirement
- ℹ️ **Match requests** - Transaction existence
- ℹ️ **Final compatibility scores** - 0-100% result only
- ℹ️ **Breeding availability** - On/off status

### Decryption Permissions

```
Pet Owner:
  ├─ Can decrypt: Own pet's encrypted data
  └─ Cannot decrypt: Other pets' data

Smart Contract:
  ├─ Can compute: Homomorphic operations
  └─ Cannot decrypt: Any encrypted data

Gateway API:
  ├─ Can decrypt: Final results only (with authorization)
  └─ Cannot access: Individual genetic markers

Third Parties:
  └─ Cannot decrypt: Any encrypted information
```

---

## 🌐 Deployment Details

### Network Information

```javascript
const DEPLOYMENT = {
  network: "Ethereum Sepolia Testnet",
  chainId: 11155111,
  contract: "0xC16ebe7Cb0A3B057437B8A3568d6Df2FB02812d1",
  explorer: "https://sepolia.etherscan.io/address/0xC16ebe7Cb0A3B057437B8A3568d6Df2FB02812d1",
  rpcUrl: "https://sepolia.infura.io/v3/YOUR_KEY",
  gatewayUrl: "https://gateway.zama.ai",
  matchingCost: "0.001 ETH",
  gatewayAPI: "v2.0+",
  faucets: [
    "https://sepoliafaucet.com/",
    "https://faucet.sepolia.dev/"
  ]
};
```

### Contract Verification

✅ **Source Code**: Verified on Etherscan
✅ **ABI**: Available in `/artifacts` directory
✅ **Constructor Args**: Documented in deployment script
✅ **License**: MIT (Open Source)

---

## 👨‍💻 For Developers

### Installation

#### Smart Contract Development
```bash
# Clone repository
git clone https://github.com/FranciscoWatsica/FHEPetDNAMatching.git
cd FHEPetDNAMatching

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration:
# - SEPOLIA_RPC_URL
# - PRIVATE_KEY
# - ETHERSCAN_API_KEY
# - NUM_PAUSERS=2
# - PAUSER_ADDRESS_0=0x...
# - PAUSER_ADDRESS_1=0x...
```

#### React Frontend Development
```bash
# Navigate to React project
cd PetDNAMatchingReact

# Install dependencies
npm install

# Development Commands
npm run dev        # Start dev server with HMR (http://localhost:3001)
npm run build      # Build optimized production bundle
npm run preview    # Preview production build locally
npm run lint       # Run ESLint for code quality

# Development Features
✨ Vite HMR: Instant component updates without page refresh
🔍 Source maps: Easy debugging in browser DevTools
📦 Code splitting: Optimized bundle loading
⚡ Fast startup: Sub-second development server boot
```

**React Project Structure Best Practices**:
```bash
src/
├── components/     # Reusable UI components
│   ├── WalletConnection.jsx    # Handles MetaMask connection
│   ├── PetRegistration.jsx     # Pet registration form & FHE encryption
│   ├── MyPets.jsx              # Display owned pets
│   ├── MatchingService.jsx     # Initiate DNA matching
│   └── ContractInfo.jsx        # Contract details & network info
├── hooks/          # Custom React hooks
│   └── useWallet.js            # Wallet state & connection logic
├── utils/          # Utility functions
│   └── fhevm.js                # FHEVM SDK initialization & helpers
├── App.jsx         # Main component with routing logic
├── App.css         # Global styles
└── main.jsx        # React root & app initialization
```

**Key React Implementation Details**:
- **State Management**: React hooks (useState, useEffect, useCallback)
- **Custom Hooks**: Encapsulate wallet logic for reusability
- **Component Props**: Type-safe data passing between components
- **Event Handling**: Modern React event system
- **Side Effects**: useEffect for blockchain interactions
- **Memoization**: Optimize re-renders with useMemo/useCallback

### Development Commands

```bash
# Compile contracts
npm run compile

# Run test suite (40+ tests)
npm test

# Run with gas reporting
npm run test:gas

# Generate coverage report
npm run test:coverage

# Run performance tests
npm run test:performance

# Check contract sizes (DoS prevention)
npm run size

# Run security audit
npm run security
```

### Deployment

```bash
# Deploy to Sepolia testnet
npm run deploy

# Verify contract on Etherscan
npm run verify

# Interact with deployed contract
npm run interact

# Simulate complete matching flow
npm run simulate
```

### Testing

```bash
# Run all tests
npm run test:all

# Run specific test file
npx hardhat test test/PetDNAMatching.test.js

# Run tests matching pattern
npx hardhat test --grep "registration"

# Run on Sepolia testnet
npm run test:sepolia
```

### Code Quality

```bash
# Lint Solidity contracts
npm run lint:sol

# Lint JavaScript code
npm run lint:js

# Format all code
npm run format

# Check formatting
npm run format:check

# Run full CI pipeline
npm run ci
```

---

## 🧪 Testing

### Test Coverage

We maintain **40+ comprehensive test cases** with **95%+ coverage**:

| Component | Coverage | Tests |
|-----------|----------|-------|
| Smart Contracts | 96% | 25 tests |
| Performance | 92% | 10 tests |
| Security | 94% | 8 tests |
| Integration | 100% | 5 tests |

### Test Scenarios

✅ **Pet Registration**
- Valid pet registration with encrypted data
- Invalid input validation
- Owner verification
- Genetic marker encryption

✅ **Matching Algorithm**
- Compatibility score calculation
- Health compatibility scoring
- Temperament matching logic
- Genetic diversity checks

✅ **Access Control**
- Owner-only modifications
- Admin functions restricted
- Breeding status management
- Payment handling

✅ **Edge Cases**
- Maximum genetic marker values (65535)
- Minimum health scores (0)
- Identical genetic markers
- Gateway callback failures

✅ **Performance**
- Gas optimization validation
- DoS attack prevention
- Concurrent operation stress tests
- Contract size limits

✅ **Security**
- Reentrancy protection
- Integer overflow/underflow
- Access control enforcement
- Payment security

For detailed testing documentation, see [TESTING.md](./TESTING.md)

---

## ⛽ Gas Costs & Performance

### Estimated Gas Usage

| Operation | Gas | ETH Cost* | USD** |
|-----------|-----|-----------|-------|
| Register Pet | ~250,000 | ~0.0075 | ~$15 |
| Create Profile | ~120,000 | ~0.0036 | ~$7 |
| Request Match | ~180,000 | ~0.0054 | ~$11 |
| Update Status | ~45,000 | ~0.00135 | ~$3 |

*30 gwei gas price | **$2000/ETH

**Note**: Matching requires additional 0.001 ETH service fee

### Why FHE Costs More

Fully Homomorphic Encryption operations are computationally intensive:

```
Regular addition: ~5,000 gas
FHE addition (euint8): ~100,000 gas (20x more)
FHE multiplication: ~200,000+ gas (40x more)

This is the cost of COMPLETE PRIVACY! 🔐
```

### Optimization Strategies

Our platform implements multiple gas optimization techniques:

✅ **Solidity Optimizer**: Enabled with 200 runs (balanced)
✅ **Storage Packing**: Efficient struct layouts
✅ **Event Usage**: Off-chain data via events
✅ **Batch Operations**: Minimize transaction count
✅ **Type Selection**: `euint8` vs `euint16` based on needs

See [GAS-OPTIMIZATION.md](./docs/GAS-OPTIMIZATION.md) for details.

---

## 🔒 Security

### Security Features

✅ **Access Control**: Owner-only administrative functions
✅ **Reentrancy Guards**: Protection on payable functions
✅ **Input Validation**: All external inputs validated
✅ **Overflow Protection**: Solidity 0.8+ built-in checks
✅ **DoS Prevention**: Contract size and gas limit monitoring
✅ **Emergency Pause**: Gateway pauser configuration

### Security Audits

- ✅ **Automated Testing**: 95%+ code coverage
- ✅ **Static Analysis**: Solhint security rules
- ✅ **Performance Tests**: DoS attack simulations
- ✅ **Gas Analysis**: Continuous monitoring
- ⏳ **External Audit**: Planned for mainnet deployment

### Threat Model

**Protected Against**:
- ✅ Genetic data exposure
- ✅ Unauthorized access
- ✅ Reentrancy attacks
- ✅ Integer overflow/underflow
- ✅ Gas limit DoS
- ✅ Front-running (via encryption)

**Known Limitations**:
- ⚠️ Transaction metadata visible (blockchain requirement)
- ⚠️ Gateway dependency for decryption
- ⚠️ Higher gas costs for FHE operations

See [SECURITY-CHECKLIST.md](./docs/SECURITY-CHECKLIST.md) for complete security documentation.

---

## 🛠️ Tech Stack

### Smart Contracts
```solidity
Solidity: ^0.8.24
@fhevm/solidity: ^0.5.0
Zama FHEVM: Sepolia testnet
Gateway API: v2.0+
Encrypted Types: euint8, euint16, ebool
FHE Operations: FHE.add, FHE.sub, FHE.ge, FHE.ne
```

### Frontend

#### Vanilla JavaScript Version (Main Demo)
```javascript
HTML5 + CSS3
JavaScript (ES6+)
Ethers.js: v5
fhevmjs: Latest
MetaMask: Web3 wallet
```

#### React Version (Modern Framework Implementation)
```javascript
React: ^18.2.0
React DOM: ^18.2.0
Vite: ^4.4.5 (Build tool with HMR)
@vitejs/plugin-react: ^4.0.3
Ethers.js: ^5.7.2
fhevmjs: ^0.5.0
ESLint: Code quality and linting
```

**React Version Architecture**:
- ⚛️ **Modern React 18**: Latest React features with concurrent rendering
- 🔄 **Vite Build System**: Lightning-fast HMR and optimized production builds
- 🎣 **Custom React Hooks**:
  - `useWallet` - Wallet connection and state management
  - Advanced state management with React hooks
- 📦 **Component-Based Architecture**:
  - `WalletConnection.jsx` - MetaMask integration component
  - `PetRegistration.jsx` - Pet registration with FHE encryption
  - `MyPets.jsx` - Pet portfolio management
  - `MatchingService.jsx` - DNA compatibility matching interface
  - `ContractInfo.jsx` - Smart contract information display
- 🛠️ **FHEVM Integration**:
  - `utils/fhevm.js` - FHEVM SDK wrapper and encryption utilities
  - Client-side encryption before blockchain submission
  - Simplified FHEVM client initialization
- 🚀 **Development Experience**:
  - Fast development server on port 3001
  - Hot Module Replacement (HMR) for instant updates
  - ESLint integration for code quality
  - Optimized production builds
- 📱 **Modular Code Organization**:
  - Separation of concerns (components/hooks/utils)
  - Reusable component patterns
  - Type-safe prop handling

**React Project Location**: `./PetDNAMatchingReact/`

**Key Technical Differences**:
- React version uses declarative component model vs imperative DOM manipulation
- Better state management with React hooks vs vanilla JavaScript state
- Component reusability and composition patterns
- Virtual DOM for optimized rendering
- Developer experience enhanced with Vite's HMR

### Development Tools

#### Smart Contract Development
```bash
Hardhat: Smart contract development framework
Solhint: Solidity linting (30+ security rules)
ESLint: JavaScript code quality
Prettier: Code formatting
Husky: Pre-commit hooks
Gas Reporter: Cost analysis
Contract Sizer: DoS prevention
Mocha + Chai: Testing framework
```

#### React Frontend Development
```bash
Vite: Next-generation frontend build tool
  - ⚡ Lightning-fast HMR (Hot Module Replacement)
  - 📦 Optimized production builds with code splitting
  - 🔧 Pre-configured for React
  - 🚀 Development server on port 3001

@vitejs/plugin-react: Official Vite plugin for React
  - Fast Refresh for instant component updates
  - JSX transformation
  - React DevTools integration

ESLint: Code quality and best practices
  - React-specific linting rules
  - Unused directive reporting
  - Maximum warnings enforcement

Development Dependencies:
  - @types/react: TypeScript definitions
  - @types/react-dom: DOM type definitions
```

#### Web3 & FHE Integration Tools
```bash
Ethers.js v5: Ethereum library for both frontends
fhevmjs: Zama FHEVM client library
  - Client-side encryption utilities
  - Contract instance creation
  - Encrypted input handling
```

### CI/CD
```yaml
GitHub Actions: Automated testing
Node.js: 18.x, 20.x (multi-version)
Codecov: Coverage reporting
Security Audit: Daily automated scans
Performance Tests: Gas optimization
```

---

## 📊 API Reference

### Core Functions

#### `registerPet()`
```solidity
function registerPet(
    string memory name,
    string memory species,
    string memory breed,
    uint256 birthYear,
    einput encryptedHealthScore,
    einput encryptedGeneticMarker1,
    einput encryptedGeneticMarker2,
    einput encryptedGeneticMarker3,
    einput encryptedTemperament,
    bytes calldata inputProof
) external returns (uint256 petId)
```
Registers a new pet with encrypted genetic data.

#### `createMatchingProfile()`
```solidity
function createMatchingProfile(
    uint256 petId,
    einput encryptedMinHealth,
    einput encryptedPreferredTemperament,
    uint256 maxAgeDifference,
    bytes calldata inputProof
) external
```
Creates breeding preferences for a pet.

#### `requestMatching()`
```solidity
function requestMatching(
    uint256 petId1,
    uint256 petId2
) external payable returns (uint256 requestId)
```
Initiates compatibility analysis between two pets. Requires 0.001 ETH payment.

#### `getPetInfo()`
```solidity
function getPetInfo(uint256 petId)
    external
    view
    returns (
        string memory name,
        string memory breed,
        uint256 birthYear,
        address owner,
        bool availableForBreeding
    )
```
Retrieves non-sensitive pet information.

---

## 🐛 Troubleshooting

### Common Issues

#### MetaMask Not Connecting
```bash
Problem: Wallet connection fails
Solution:
  1. Ensure Sepolia testnet is added to MetaMask
  2. Check site permissions in MetaMask settings
  3. Clear browser cache and reconnect
  4. Try disconnecting and reconnecting wallet
```

#### Transaction Reverting
```bash
Problem: Transactions fail on Sepolia
Solution:
  1. Check Sepolia ETH balance (get from faucet)
  2. Verify contract address is correct
  3. Increase gas limit if needed
  4. View error on Etherscan for details
```

#### Gateway Callback Timeout
```bash
Problem: Match results not appearing
Solution:
  1. Gateway callbacks take 30-60 seconds
  2. Check transaction status on Etherscan
  3. Verify Gateway API is running
  4. Retry request if callback failed
```

#### High Gas Costs
```bash
Problem: Transactions expensive
Solution:
  • FHE operations are inherently gas-intensive
  • This is the cost of complete privacy
  • Batch operations when possible
  • Use appropriate encrypted types (euint8 vs euint16)
```

See full troubleshooting guide in [SECURITY-CHECKLIST.md](./docs/SECURITY-CHECKLIST.md)

---

## 🗺️ Roadmap

### Phase 1: MVP (Current) ✅
- [x] Basic pet registration with FHE encryption
- [x] Compatibility matching algorithm (Health + Temperament + Diversity)
- [x] **Vanilla JavaScript Frontend**:
  - [x] Web interface with MetaMask integration
  - [x] Direct Ethers.js blockchain interaction
  - [x] FHEVM client-side encryption
  - [x] GitHub Pages deployment
- [x] **React Frontend (PetDNAMatchingReact/)**:
  - [x] Modern React 18 hooks architecture
  - [x] Component-based UI (WalletConnection, PetRegistration, MyPets, MatchingService, ContractInfo)
  - [x] Custom hooks (useWallet for state management)
  - [x] Vite build system with HMR
  - [x] FHEVM SDK integration (utils/fhevm.js)
  - [x] ESLint code quality enforcement
  - [x] Development server on port 3001
- [x] Sepolia testnet deployment (0xC16ebe7Cb0A3B057437B8A3568d6Df2FB02812d1)
- [x] Comprehensive testing suite (40+ tests, 95% coverage)
- [x] Dual frontend options for different use cases

### Phase 2: Enhanced Features (Q1 2025)
- [ ] Multi-species support (cats, birds, reptiles)
- [ ] Advanced genetic marker analysis
- [ ] Mobile app (iOS/Android)
- [ ] Veterinarian verification system
- [ ] Breeding certificate NFTs

### Phase 3: Ecosystem Growth (Q2 2025)
- [ ] Integration with pet registries
- [ ] DAO governance for platform
- [ ] Partnership with breeders associations
- [ ] Machine learning compatibility models
- [ ] Genetic disease prediction

### Phase 4: Mainnet Launch (Q3 2025)
- [ ] External security audit
- [ ] Mainnet deployment
- [ ] Token launch for governance
- [ ] Staking mechanisms
- [ ] Enterprise partnerships

---

## 🤝 Contributing

We welcome contributions from the community!

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes and add tests
4. **Run** tests: `npm test`
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open** a Pull Request

### Development Guidelines

- ✅ Write tests for all new features (maintain 90%+ coverage)
- ✅ Follow Solidity style guide
- ✅ Document all public functions with NatSpec
- ✅ Run linting before committing: `npm run lint`
- ✅ Keep commits atomic and well-described
- ✅ Update README for significant changes

### Areas We Need Help

- 🐛 Bug fixes and security improvements
- 📚 Documentation enhancements
- 🌍 Translations (internationalization)
- 🧪 Additional test cases
- 🎨 UI/UX improvements
- 🔧 Gas optimization

---

## 📄 License

**MIT License** - see [LICENSE](./LICENSE) file for details.

This project is open source and free to use for any purpose.

---

## 🙏 Acknowledgments

**Built for the Zama FHE Challenge** - demonstrating practical privacy-preserving applications.

Special thanks to:

- **[Zama](https://zama.ai/)** - For FHEVM technology and privacy infrastructure
- **[Ethereum Foundation](https://ethereum.org/)** - For Sepolia testnet
- **[MetaMask](https://metamask.io/)** - For seamless wallet integration
- **[Hardhat](https://hardhat.org/)** - For development environment
- **Open Source Community** - For continuous support and feedback

---

## 📚 Resources

### Documentation
- 📖 [Gas Optimization Guide](./docs/GAS-OPTIMIZATION.md)
- 📖 [Security Checklist](./docs/SECURITY-CHECKLIST.md)
- 📖 [Toolchain Integration](./docs/TOOLCHAIN-INTEGRATION.md)
- 📖 [Testing Guide](./TESTING.md)

### External Links
- 🔗 [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- 🔗 [Hardhat Documentation](https://hardhat.org/docs)
- 🔗 [Solidity Documentation](https://docs.soliditylang.org/)
- 🔗 [Ethers.js Documentation](https://docs.ethers.org/)

### Community
- 💬 [Zama Discord](https://discord.com/invite/zama)
- 💬 [GitHub Issues](https://github.com/FranciscoWatsica/FHEPetDNAMatching/issues)
- 💬 [GitHub Discussions](https://github.com/FranciscoWatsica/FHEPetDNAMatching/discussions)

### Tools
- 🔧 [Sepolia Faucet](https://sepoliafaucet.com/)
- 🔧 [Sepolia Etherscan](https://sepolia.etherscan.io/)
- 🔧 [MetaMask Download](https://metamask.io/)
- 🔧 [Gateway Status](https://gateway.zama.ai/)

---

## 📞 Contact & Support

**Questions?** Open an issue on [GitHub Issues](https://github.com/FranciscoWatsica/PetDNAMatching/issues)

**Collaboration?** Contact the development team via GitHub

**Community?** Join the [Zama Discord](https://discord.com/invite/zama)

---

<div align="center">

**🐾 Protecting Pet Genetics, One Encrypted Match at a Time 🔐**

Built with ❤️ using [Zama FHEVM](https://zama.ai/)

[Live Demo](https://franciscowatsica.github.io/FHEPetDNAMatching/) • [Documentation](./docs) • [Report Bug](https://github.com/FranciscoWatsica/PetDNAMatching/issues) • [Request Feature](https://github.com/FranciscoWatsica/PetDNAMatching/issues)

</div>

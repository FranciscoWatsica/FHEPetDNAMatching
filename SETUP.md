# Setup Guide - FHEVM Pet DNA Matching

Complete setup instructions for deploying and running the Privacy Pet DNA Matching system.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MetaMask browser extension
- Sepolia testnet ETH

## Installation

### 1. Install All Dependencies

From the root directory:

```bash
npm run install:all
```

This installs dependencies for:
- Root workspace
- Smart contracts package
- Next.js example application

### 2. Configure Environment Variables

Create `.env` file in `packages/contracts/`:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Security Warning**: Never commit `.env` files to version control!

## Smart Contract Deployment

### Compile Contracts

```bash
npm run build:contracts
```

This compiles the PetDNAMatching contract and generates:
- ABI files in `artifacts/`
- TypeChain types in `typechain-types/`

### Deploy to Sepolia

```bash
npm run deploy:contracts
```

The deployment script will output:
- Contract address
- Owner address
- Network information
- Etherscan verification link

### Current Deployment

**Already deployed contract:**
- Address: `0xC16ebe7Cb0A3B057437B8A3568d6Df2FB02812d1`
- Network: Sepolia Testnet
- Etherscan: [View Contract](https://sepolia.etherscan.io/address/0xC16ebe7Cb0A3B057437B8A3568d6Df2FB02812d1)

## Running the Application

### Next.js Development Server

```bash
npm run dev:nextjs
```

Access the application at: [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build:nextjs
npm run start:nextjs
```

## Frontend Configuration

If you deploy a new contract, update the contract address in:

1. `examples/nextjs/app/page.tsx`:
```typescript
const CONTRACT_ADDRESS = 'YOUR_NEW_CONTRACT_ADDRESS';
```

2. `index.html` (standalone version):
```javascript
const CONTRACT_ADDRESS = "YOUR_NEW_CONTRACT_ADDRESS";
```

## Testing

### Test Smart Contracts

```bash
npm run test:contracts
```

### Manual Testing Workflow

1. **Connect Wallet**
   - Open application
   - Click "Connect Wallet"
   - Approve MetaMask connection
   - Ensure Sepolia network is selected

2. **Register Pet**
   - Fill in pet information
   - Set genetic markers (0-65535)
   - Submit transaction
   - Wait for confirmation

3. **Create Matching Profile**
   - Select registered pet ID
   - Set minimum health score
   - Define temperament preferences
   - Set maximum age

4. **Request Match**
   - Select two pet IDs
   - Pay 0.001 ETH fee
   - Wait for compatibility calculation
   - View match results

## Project Structure

```
fhevm-react-template/
├── packages/
│   └── contracts/          # Smart contracts
│       ├── contracts/      # Solidity files
│       ├── scripts/        # Deployment scripts
│       ├── test/           # Contract tests
│       └── hardhat.config.js
├── examples/
│   └── nextjs/            # Next.js application
│       ├── app/           # Next.js 14 App Router
│       ├── public/        # Static assets
│       └── package.json
├── index.html             # Standalone HTML version
├── package.json           # Root package manager
└── README.md              # Main documentation
```

## Common Issues

### MetaMask Connection Failed

**Solution**: Refresh page and ensure MetaMask is unlocked

### Wrong Network

**Solution**: Switch to Sepolia testnet in MetaMask:
- Network Name: Sepolia
- RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
- Chain ID: 11155111
- Currency Symbol: ETH
- Block Explorer: https://sepolia.etherscan.io

### Transaction Reverted

**Possible causes:**
- Insufficient Sepolia ETH
- Invalid input values
- Birth year outside 2000-2024 range
- Health score or temperament out of bounds

### Gas Estimation Error

**Solution**: Ensure all input values meet contract requirements:
- Health score: 0-100
- Temperament: 0-10
- Birth year: 2000-2024
- Genetic markers: 0-65535

## Getting Testnet ETH

Get free Sepolia ETH from faucets:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Faucet](https://sepoliafaucet.com/)
- [Infura Faucet](https://www.infura.io/faucet/sepolia)

## Support

- GitHub Issues: [Report bugs](https://github.com/FranciscoWatsica/PetDNAMatching/issues)
- Documentation: See README.md
- Live Demo: [https://franciscowatsica.github.io/PetDNAMatching/](https://franciscowatsica.github.io/PetDNAMatching/)

## Security Notes

1. **Never share private keys**
2. **Use testnet for development**
3. **Audit contracts before mainnet deployment**
4. **Keep dependencies updated**
5. **Use hardware wallets for production**

## Next Steps

After setup, you can:
- Customize the UI in `examples/nextjs/app/page.tsx`
- Modify smart contract logic in `packages/contracts/contracts/PetDNAMatching.sol`
- Add new features (breeding certificates, vet verification, etc.)
- Deploy to mainnet (after thorough testing and auditing)

---

**Happy Building!** 🐾🔐

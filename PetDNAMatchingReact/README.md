# Private Pet DNA Matching System - React Version

A React-based implementation of the Private Pet DNA Matching System using FHEVM SDK for privacy-preserving genetic matching.

## Features

- **React Hooks Architecture**: Modern React with custom hooks for wallet and FHEVM operations
- **FHEVM SDK Integration**: Uses SimpleFHEVMClient wrapper for encryption operations
- **Wallet Connection**: MetaMask integration with account and balance display
- **Pet Registration**: Register pets with encrypted genetic data
- **My Pets Management**: View and manage breeding status of registered pets
- **Matching Service**: Request privacy-preserving compatibility matching between pets
- **Contract Information**: View smart contract details and statistics

## Project Structure

```
PetDNAMatchingReact/
├── src/
│   ├── components/
│   │   ├── WalletConnection.jsx
│   │   ├── PetRegistration.jsx
│   │   ├── MyPets.jsx
│   │   ├── MatchingService.jsx
│   │   └── ContractInfo.jsx
│   ├── hooks/
│   │   └── useWallet.js
│   ├── utils/
│   │   └── fhevm.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. **Connect Wallet**: Click "Connect MetaMask Wallet" to connect your wallet
2. **Register Pet**: Fill in pet details and genetic markers, then click "Register Pet"
3. **Load Pets**: Click "Load My Pets" to view your registered pets
4. **Request Matching**: Select two pets and request compatibility matching
5. **View Contract Info**: Load contract statistics and information

## SDK Integration

This React version integrates the FHEVM SDK through:

- **SimpleFHEVMClient**: Core SDK client class in `src/utils/fhevm.js`
- **useWallet Hook**: Custom hook managing wallet connection and SDK initialization
- **Encryption**: Automated encryption of sensitive genetic data before blockchain transactions

## Smart Contract

- **Network**: Ethereum Sepolia Testnet
- **Address**: `0xC16ebe7Cb0A3B057437B8A3568d6Df2FB02812d1`
- **Gateway**: API v2.0+ Compatible

## Technologies

- React 18.2
- Vite 4.4
- Ethers.js 5.7
- fhevmjs 0.5.0
- FHEVM SDK Integration

## Development

The application uses Vite for fast development and hot module replacement. Run `npm run dev` to start the development server on `http://localhost:3001`.

## License

MIT License

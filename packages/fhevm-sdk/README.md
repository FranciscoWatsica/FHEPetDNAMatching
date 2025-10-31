# @fhevm-pet-dna/sdk

**Universal FHEVM SDK for Building Privacy-Preserving dApps**

A framework-agnostic TypeScript SDK for building decentralized applications with Fully Homomorphic Encryption (FHE) using Zama's fhEVM. This SDK provides a simple, consistent API for encrypting inputs, decrypting outputs, and interacting with FHE-enabled smart contracts.

---

## 🎯 Features

- ✅ **Framework Agnostic**: Works with React, Vue, Node.js, or vanilla JavaScript
- ✅ **Type-Safe**: Full TypeScript support with comprehensive type definitions
- ✅ **Easy to Use**: Intuitive API inspired by wagmi and web3 libraries
- ✅ **React Hooks**: First-class React support with custom hooks
- ✅ **Vue Composables**: Vue 3 Composition API support
- ✅ **Gateway API v2.0+**: Compatible with latest FHEVM features
- ✅ **Modular**: Import only what you need
- ✅ **Well-Documented**: Comprehensive examples and API documentation

---

## 📦 Installation

```bash
npm install @fhevm-pet-dna/sdk ethers@^5.7.0
```

### Peer Dependencies

- `ethers`: ^5.7.0 (required)
- `react`: >=16.8.0 (optional, for React hooks)
- `vue`: >=3.0.0 (optional, for Vue composables)

---

## 🚀 Quick Start

### Vanilla JavaScript/TypeScript

```typescript
import { FHEVMClient } from '@fhevm-pet-dna/sdk';
import { ethers } from 'ethers';

// Create provider and signer
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// Initialize FHEVM client
const client = new FHEVMClient({
  provider,
  signer,
  chainId: 11155111, // Sepolia
});

await client.initialize();

// Encrypt a value
const encrypted = await client.encrypt({
  value: 42,
  type: 'euint8',
  contractAddress: '0xYourContractAddress',
});

console.log('Encrypted data:', encrypted.data);
console.log('Signature:', encrypted.signature);
```

### React

```tsx
import { useFHEVM, useEncrypt } from '@fhevm-pet-dna/sdk/react';

function MyComponent() {
  const { client, isInitialized, error } = useFHEVM({
    chainId: 11155111,
    autoInitialize: true,
  });

  const { encrypt, isEncrypting } = useEncrypt(client);

  const handleEncrypt = async () => {
    try {
      const result = await encrypt({
        value: 42,
        type: 'euint8',
        contractAddress: '0xYourContractAddress',
      });
      console.log('Encrypted:', result);
    } catch (err) {
      console.error('Encryption failed:', err);
    }
  };

  if (!isInitialized) {
    return <div>Initializing FHEVM...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <button onClick={handleEncrypt} disabled={isEncrypting}>
      {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
    </button>
  );
}
```

### Vue 3

```vue
<script setup>
import { useFHEVM, useEncrypt } from '@fhevm-pet-dna/sdk/vue';

const { client, isInitialized, error } = useFHEVM({
  chainId: 11155111,
  autoInitialize: true,
});

const { encrypt, isEncrypting } = useEncrypt(client);

async function handleEncrypt() {
  try {
    const result = await encrypt({
      value: 42,
      type: 'euint8',
      contractAddress: '0xYourContractAddress',
    });
    console.log('Encrypted:', result);
  } catch (err) {
    console.error('Encryption failed:', err);
  }
}
</script>

<template>
  <div v-if="!isInitialized">Initializing FHEVM...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <button v-else @click="handleEncrypt" :disabled="isEncrypting">
    {{ isEncrypting ? 'Encrypting...' : 'Encrypt Value' }}
  </button>
</template>
```

---

## 📚 Core API

### FHEVMClient

Main client for FHEVM operations.

#### Constructor

```typescript
const client = new FHEVMClient({
  provider: ethers.providers.Provider,
  signer?: ethers.Signer,
  chainId: number,
  gatewayUrl?: string,
  aclAddress?: string,
  kmsVerifierAddress?: string,
});
```

#### Methods

**`initialize(): Promise<void>`**

Initialize the FHEVM instance. Must be called before any operations.

```typescript
await client.initialize();
```

**`encrypt(input: EncryptionInput): Promise<EncryptedResult>`**

Encrypt a value for contract interaction.

```typescript
const result = await client.encrypt({
  value: 42,
  type: 'euint8', // or 'euint16', 'euint32', etc.
  contractAddress: '0x...',
  userAddress: '0x...', // optional
});
```

**`decrypt(request: DecryptionRequest): Promise<bigint[]>`**

Decrypt encrypted contract outputs.

```typescript
const values = await client.decrypt({
  contractAddress: '0x...',
  handles: ['0xhandle1', '0xhandle2'],
});
```

**`createReencryptionRequest(contractAddress: string, handle: string): Promise<string>`**

Create a reencryption request for viewing encrypted data.

```typescript
const signature = await client.createReencryptionRequest(
  '0xContractAddress',
  '0xHandle'
);
```

---

### FHEVMContract

High-level contract interaction helper.

```typescript
import { FHEVMContract } from '@fhevm-pet-dna/sdk';

const contract = new FHEVMContract({
  address: '0xYourContract',
  abi: contractABI,
  client: fhevmClient,
  signer: ethers.Signer,
});

// Call function with encrypted parameters
const tx = await contract.callWithEncryption(
  'registerPet',
  ['Fluffy', 'Cat', 2020, 85, 12345, 54321, 23456, 5],
  [
    { index: 3, type: 'euint8' },  // healthScore
    { index: 4, type: 'euint16' }, // geneticMarker1
    { index: 5, type: 'euint16' }, // geneticMarker2
    { index: 6, type: 'euint16' }, // geneticMarker3
    { index: 7, type: 'euint8' },  // temperament
  ]
);

await tx.wait();
```

---

## 🎣 React Hooks

### useFHEVM

Main hook for FHEVM client management.

```typescript
const {
  client,           // FHEVMClient instance
  isInitialized,    // boolean
  isInitializing,   // boolean
  error,            // Error | null
  initialize,       // () => Promise<void>
  reset,            // () => void
  status,           // InitializationStatus
} = useFHEVM({
  chainId: 11155111,
  autoInitialize: true, // default: true
});
```

### useEncrypt

Hook for encrypting values.

```typescript
const {
  encrypt,      // (input: EncryptionInput) => Promise<EncryptedResult>
  isEncrypting, // boolean
  error,        // Error | null
  lastResult,   // EncryptedResult | null
} = useEncrypt(client);
```

### useDecrypt

Hook for decrypting values.

```typescript
const {
  decrypt,      // (request: DecryptionRequest) => Promise<bigint[]>
  isDecrypting, // boolean
  error,        // Error | null
  lastResults,  // bigint[] | null
} = useDecrypt(client);
```

### useFHEVMContract

Hook for contract interactions.

```typescript
const {
  contract,  // FHEVMContract | null
  call,      // (name, args, encryptedIndices) => Promise<Transaction>
  view,      // (name, args) => Promise<any>
  isLoading, // boolean
  error,     // Error | null
} = useFHEVMContract({
  address: '0x...',
  abi: contractABI,
  client,
  signer,
});
```

### FHEVMProvider

Context provider for sharing FHEVM client.

```tsx
import { FHEVMProvider, useFHEVMContext } from '@fhevm-pet-dna/sdk/react';

function App() {
  return (
    <FHEVMProvider chainId={11155111} autoInitialize>
      <MyComponent />
    </FHEVMProvider>
  );
}

function MyComponent() {
  const { client, isInitialized } = useFHEVMContext();
  // Use client...
}
```

---

## 🎨 Vue Composables

All React hooks have equivalent Vue 3 composables:

- `useFHEVM`
- `useEncrypt`
- `useDecrypt`
- `useFHEVMContract`

Usage is nearly identical, with Vue's reactive `ref` objects instead of React state.

---

## 🔧 Utility Functions

### Validation

```typescript
import { validateEncryptedValue } from '@fhevm-pet-dna/sdk';

validateEncryptedValue(255, 'euint8'); // OK
validateEncryptedValue(256, 'euint8'); // Throws error
```

### Formatting

```typescript
import { formatEncryptedValue, shortenAddress } from '@fhevm-pet-dna/sdk';

formatEncryptedValue(BigInt(1000000), 6); // "1.000000"
shortenAddress('0x1234...abcd'); // "0x1234...abcd"
```

### Retry Logic

```typescript
import { retryWithBackoff } from '@fhevm-pet-dna/sdk';

const result = await retryWithBackoff(
  async () => await riskyOperation(),
  3,     // maxAttempts
  1000   // initialDelay in ms
);
```

---

## 📖 Examples

### Full Pet Registration Example

```typescript
import { FHEVMClient, FHEVMContract } from '@fhevm-pet-dna/sdk';
import { ethers } from 'ethers';

// Setup
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const client = new FHEVMClient({
  provider,
  signer,
  chainId: 11155111,
});

await client.initialize();

// Create contract instance
const contract = new FHEVMContract({
  address: '0xC16ebe7Cb0A3B057437B8A3568d6Df2FB02812d1',
  abi: PetDNAMatchingABI,
  client,
  signer,
});

// Register pet with encrypted data
const tx = await contract.callWithEncryption(
  'registerPet',
  [
    'Max',                    // name
    'Dog',                    // species
    'Golden Retriever',       // breed
    2021,                     // birthYear
    90,                       // healthScore (encrypted)
    12345,                    // geneticMarker1 (encrypted)
    54321,                    // geneticMarker2 (encrypted)
    23456,                    // geneticMarker3 (encrypted)
    7,                        // temperament (encrypted)
  ],
  [
    { index: 4, type: 'euint8' },
    { index: 5, type: 'euint16' },
    { index: 6, type: 'euint16' },
    { index: 7, type: 'euint16' },
    { index: 8, type: 'euint8' },
  ]
);

await tx.wait();
console.log('Pet registered!');
```

---

## 🏗️ Architecture

```
@fhevm-pet-dna/sdk
├── core/
│   ├── FHEVMClient.ts       # Core client implementation
│   └── ContractHelpers.ts   # Contract interaction utilities
├── react/
│   ├── useFHEVM.ts          # React hooks
│   ├── useEncrypt.ts
│   ├── useDecrypt.ts
│   ├── useFHEVMContract.ts
│   └── FHEVMContext.tsx     # React context
├── vue/
│   ├── useFHEVM.ts          # Vue composables
│   ├── useEncrypt.ts
│   ├── useDecrypt.ts
│   └── useFHEVMContract.ts
└── utils/
    ├── types.ts             # TypeScript types
    └── helpers.ts           # Utility functions
```

---

## 🔐 Security Considerations

1. **Never expose private keys**: Always use secure wallet connections
2. **Validate inputs**: Use provided validation functions
3. **Use testnet first**: Test thoroughly on Sepolia before mainnet
4. **Keep dependencies updated**: Regular security updates
5. **Access control**: Implement proper permissions in contracts

---

## 🧪 Testing

```bash
npm run test
```

---

## 📄 License

MIT

---

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

## 📞 Support

- GitHub Issues: [Report bugs](https://github.com/FranciscoWatsica/PetDNAMatching/issues)
- Documentation: See examples in `/examples` directory
- Zama Docs: https://docs.zama.ai/fhevm

---

**Built with ❤️ for the Zama FHEVM ecosystem**

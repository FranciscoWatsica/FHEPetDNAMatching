# FHEVM SDK Documentation

## 📦 What is the FHEVM SDK?

The **@fhevm-pet-dna/sdk** is a universal, framework-agnostic TypeScript SDK that makes building privacy-preserving dApps with Fully Homomorphic Encryption (FHE) simple and intuitive.

### Key Principles

1. **Framework Agnostic**: Core functionality works with any JavaScript/TypeScript environment
2. **Framework Adapters**: Specialized hooks for React and composables for Vue 3
3. **Wagmi-like API**: Familiar patterns for web3 developers
4. **Type-Safe**: Full TypeScript support throughout
5. **Modular**: Import only what you need

---

## 🎯 Design Goals

### 1. Simplicity

The SDK hides the complexity of FHEVM while exposing a clean, intuitive API:

```typescript
// Before: Complex fhevmjs setup
const instance = await createInstance({ ... });
const keypair = instance.generateKeypair();
const encrypted = instance.encrypt(...);
const signature = await signer._signTypedData(...);

// After: Simple SDK usage
const client = new FHEVMClient({ provider, signer, chainId });
await client.initialize();
const encrypted = await client.encrypt({ value, type, contractAddress });
```

### 2. Framework Support

**Core SDK** (framework-agnostic):
```typescript
import { FHEVMClient } from '@fhevm-pet-dna/sdk';
```

**React Integration**:
```typescript
import { useFHEVM, useEncrypt } from '@fhevm-pet-dna/sdk/react';
```

**Vue Integration**:
```typescript
import { useFHEVM, useEncrypt } from '@fhevm-pet-dna/sdk/vue';
```

### 3. Complete Abstraction

The SDK wraps all required packages:
- ✅ `fhevmjs` - Core FHEVM functionality
- ✅ `ethers` - Blockchain interactions
- ✅ EIP-712 signatures - Access control
- ✅ Gateway API v2.0+ - Decryption handling

Developers only install one package: `@fhevm-pet-dna/sdk`

---

## 🏗️ Architecture

### Layer 1: Core SDK (`src/core/`)

**FHEVMClient.ts** - Main client class
- Initialization of fhevmjs instance
- Encryption of inputs
- Decryption of outputs
- EIP-712 signature generation
- Reencryption requests

**ContractHelpers.ts** - Contract interaction utilities
- `FHEVMContract` class for high-level contract calls
- Automatic encryption of specified parameters
- Gas estimation helpers
- Transaction waiting utilities

### Layer 2: Utility Functions (`src/utils/`)

**types.ts** - TypeScript definitions
- `EncryptedType` union
- `NetworkConfig` interface
- `InitializationStatus` enum
- Pre-defined network configurations

**helpers.ts** - Common utilities
- Value validation (`validateEncryptedValue`)
- Format functions (`formatEncryptedValue`, `shortenAddress`)
- Retry logic (`retryWithBackoff`)
- Error parsing (`parseContractError`)

### Layer 3: Framework Adapters

**React (`src/react/`)**:
- `useFHEVM` - Client initialization and management
- `useEncrypt` - Encryption operations with loading states
- `useDecrypt` - Decryption operations with loading states
- `useFHEVMContract` - Contract interactions with React patterns
- `FHEVMProvider` / `useFHEVMContext` - Context for client sharing

**Vue (`src/vue/`)**:
- Same functionality as React but using Vue 3 Composition API
- `ref` and `computed` for reactive state
- `onMounted` / `onUnmounted` lifecycle hooks

---

## 📖 Usage Patterns

### Pattern 1: Direct Client Usage (Node.js, Scripts)

```typescript
import { FHEVMClient } from '@fhevm-pet-dna/sdk';
import { ethers } from 'ethers';

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const client = new FHEVMClient({
  provider,
  signer: wallet,
  chainId: 11155111,
});

await client.initialize();

const encrypted = await client.encrypt({
  value: 42,
  type: 'euint8',
  contractAddress: CONTRACT_ADDRESS,
});
```

**Use Case**: CLI tools, backend services, testing scripts

### Pattern 2: React Hooks (Frontend dApps)

```tsx
import { useFHEVM, useFHEVMContract } from '@fhevm-pet-dna/sdk/react';
import { useEthers } from 'some-wallet-lib';

function MyComponent() {
  const { signer } = useEthers();
  const { client, isInitialized } = useFHEVM({
    chainId: 11155111,
  });

  const { call, isLoading } = useFHEVMContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    client,
    signer,
  });

  const handleRegister = async () => {
    await call('registerPet', [name, species, breed, ...], [
      { index: 4, type: 'euint8' },
    ]);
  };

  return <button onClick={handleRegister}>Register</button>;
}
```

**Use Case**: React dApps with wallet integration

### Pattern 3: Vue Composables (Frontend dApps)

```vue
<script setup>
import { useFHEVM, useFHEVMContract } from '@fhevm-pet-dna/sdk/vue';

const { client, isInitialized } = useFHEVM({
  chainId: 11155111,
});

const { call, isLoading } = useFHEVMContract({
  address: CONTRACT_ADDRESS,
  abi: ABI,
  client,
  signer,
});

async function handleRegister() {
  await call('registerPet', [name, species, breed, ...], [
    { index: 4, type: 'euint8' },
  ]);
}
</script>
```

**Use Case**: Vue 3 dApps with Composition API

### Pattern 4: Context/Provider Pattern (React)

```tsx
import { FHEVMProvider, useFHEVMContext } from '@fhevm-pet-dna/sdk/react';

function App() {
  return (
    <FHEVMProvider chainId={11155111} autoInitialize>
      <Dashboard />
    </FHEVMProvider>
  );
}

function Dashboard() {
  const { client, isInitialized } = useFHEVMContext();
  // Client available in any child component
}
```

**Use Case**: Large React apps with shared FHEVM client

---

## 🔄 Encryption/Decryption Flow

### Encryption Flow

```
User Input (plaintext)
    ↓
SDK validateEncryptedValue()
    ↓
fhevmjs encrypt()
    ↓
Generate EIP-712 signature
    ↓
Return { data, signature }
    ↓
Contract call with encrypted data
```

### Decryption Flow

```
Contract returns encrypted handle
    ↓
SDK createReencryptionRequest()
    ↓
Generate EIP-712 signature
    ↓
Gateway API processes request
    ↓
Return decrypted value
    ↓
SDK formats result for display
```

---

## 🎨 API Design Principles

### 1. Consistency

All methods follow similar patterns:
```typescript
// Initialization
await client.initialize();

// Operations
const result = await client.encrypt(input);
const values = await client.decrypt(request);
const signature = await client.createReencryptionRequest(address, handle);
```

### 2. Error Handling

All methods throw descriptive errors:
```typescript
try {
  await client.encrypt(...);
} catch (error) {
  console.error(parseContractError(error));
}
```

### 3. TypeScript First

Strong typing throughout:
```typescript
type EncryptedType = 'euint8' | 'euint16' | 'euint32' | ...;

interface EncryptionInput {
  value: number | bigint;
  type: EncryptedType;
  contractAddress: string;
}
```

### 4. Loading States

React hooks and Vue composables provide loading indicators:
```typescript
const { encrypt, isEncrypting } = useEncrypt(client);
```

---

## 🔧 Advanced Features

### Batch Operations

```typescript
// Encrypt multiple values
const values = [42, 100, 255];
const encrypted = await Promise.all(
  values.map(v => client.encrypt({
    value: v,
    type: 'euint8',
    contractAddress: CONTRACT_ADDRESS,
  }))
);
```

### Event Listening

```typescript
const contract = new FHEVMContract({ ... });

contract.on('PetRegistered', (petId, owner, name) => {
  console.log(`Pet ${name} registered with ID ${petId}`);
});
```

### Gas Optimization

```typescript
import { estimateEncryptedGas } from '@fhevm-pet-dna/sdk';

const gasEstimate = await estimateEncryptedGas(
  contract.getContract(),
  'registerPet',
  args
);
```

---

## 📚 Real-World Example: Pet DNA Matching

See the complete implementation in `examples/nextjs/` which demonstrates:

1. **Client initialization** with MetaMask
2. **Encrypted pet registration** with genetic markers
3. **Matching profile creation** with encrypted preferences
4. **Compatibility matching** with encrypted computation
5. **Result decryption** and display

---

## 🎯 Why This SDK Solves the Problem

### Before

- ❌ Developers need to understand fhevmjs internals
- ❌ Manual EIP-712 signature generation
- ❌ Complex Gateway API integration
- ❌ Repetitive boilerplate for each dApp
- ❌ Framework-specific reimplementation

### After

- ✅ Simple, intuitive API
- ✅ Automatic signature handling
- ✅ Built-in Gateway API support
- ✅ Reusable across projects
- ✅ Framework adapters included

---

## 🚀 Getting Started

See the main README for installation and quick start guide.

For complete examples, check:
- `packages/fhevm-sdk/README.md` - SDK documentation
- `examples/nextjs/` - Next.js example
- `index.html` - Standalone HTML example

---

**The Universal FHEVM SDK - Making Privacy-Preserving dApps Simple** 🔐

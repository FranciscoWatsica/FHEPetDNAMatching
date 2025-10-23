/**
 * @fhevm-pet-dna/sdk
 *
 * Universal FHEVM SDK for building privacy-preserving dApps
 *
 * This SDK provides a simple, framework-agnostic API for:
 * - Initializing FHEVM instances
 * - Encrypting inputs for contract calls
 * - Decrypting contract outputs
 * - Managing access control with EIP-712 signatures
 *
 * @example
 * ```typescript
 * import { FHEVMClient } from '@fhevm-pet-dna/sdk';
 *
 * const client = new FHEVMClient({
 *   provider: window.ethereum,
 *   chainId: 11155111,
 * });
 *
 * await client.initialize();
 *
 * const encrypted = await client.encrypt({
 *   value: 42,
 *   type: 'euint8',
 *   contractAddress: '0x...',
 * });
 * ```
 */

// Core exports
export { FHEVMClient } from './core/FHEVMClient';
export type {
  FHEVMClientConfig,
  EncryptionInput,
  DecryptionRequest,
} from './core/FHEVMClient';

export { FHEVMContract, estimateEncryptedGas, waitForTransaction } from './core/ContractHelpers';
export type { ContractConfig } from './core/ContractHelpers';

// Utility exports
export * from './utils/types';
export * from './utils/helpers';

// Re-export fhevmjs types for convenience
export type { FhevmInstance, Keypair } from 'fhevmjs';

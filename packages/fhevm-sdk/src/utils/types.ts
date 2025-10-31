/**
 * Common types used throughout the SDK
 */

import { ethers } from 'ethers';

/**
 * Supported encrypted integer types in FHEVM
 */
export type EncryptedType =
  | 'euint8'
  | 'euint16'
  | 'euint32'
  | 'euint64'
  | 'euint128'
  | 'euint256'
  | 'ebool';

/**
 * Network configuration for FHEVM
 */
export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  gatewayUrl?: string;
  aclAddress?: string;
  kmsVerifierAddress?: string;
  blockExplorer?: string;
}

/**
 * Predefined network configurations
 */
export const NETWORKS: Record<string, NetworkConfig> = {
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
  localhost: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://localhost:8545',
  },
};

/**
 * Transaction options for encrypted calls
 */
export interface TransactionOptions {
  gasLimit?: ethers.BigNumberish;
  gasPrice?: ethers.BigNumberish;
  nonce?: number;
  value?: ethers.BigNumberish;
}

/**
 * Result of an encrypted operation
 */
export interface EncryptedResult {
  data: Uint8Array;
  signature: string;
  handle?: string;
}

/**
 * Decryption result with metadata
 */
export interface DecryptionResult {
  value: bigint;
  handle: string;
  timestamp: number;
}

/**
 * Event listener callback type
 */
export type EventCallback = (...args: any[]) => void | Promise<void>;

/**
 * SDK initialization status
 */
export enum InitializationStatus {
  NOT_INITIALIZED = 'not_initialized',
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  ERROR = 'error',
}

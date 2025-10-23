/**
 * FHEVMClient - Core client for interacting with FHEVM contracts
 *
 * This is the main entry point for the SDK. It handles:
 * - Initialization of fhevmjs instance
 * - Encryption of inputs for contract calls
 * - Decryption of encrypted outputs
 * - EIP-712 signature generation for access control
 */

import { ethers } from 'ethers';
import { createInstance, FhevmInstance, Keypair } from 'fhevmjs';

export interface FHEVMClientConfig {
  provider: ethers.providers.Provider;
  signer?: ethers.Signer;
  chainId: number;
  gatewayUrl?: string;
  aclAddress?: string;
  kmsVerifierAddress?: string;
}

export interface EncryptionInput {
  value: number | bigint;
  type: 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'euint128' | 'euint256' | 'ebool';
  contractAddress: string;
  userAddress?: string;
}

export interface DecryptionRequest {
  contractAddress: string;
  handles: string[];
}

export class FHEVMClient {
  private instance: FhevmInstance | null = null;
  private config: FHEVMClientConfig;
  private keypair: Keypair | null = null;

  constructor(config: FHEVMClientConfig) {
    this.config = config;
  }

  /**
   * Initialize the FHEVM instance
   * Must be called before any encryption/decryption operations
   */
  async initialize(): Promise<void> {
    if (this.instance) {
      return; // Already initialized
    }

    try {
      this.instance = await createInstance({
        chainId: this.config.chainId,
        publicKey: await this.getPublicKey(),
        gatewayUrl: this.config.gatewayUrl,
        aclAddress: this.config.aclAddress,
        kmsVerifierAddress: this.config.kmsVerifierAddress,
      });

      // Generate keypair for this session
      this.keypair = this.instance.generateKeypair();
    } catch (error) {
      throw new Error(`Failed to initialize FHEVM instance: ${error}`);
    }
  }

  /**
   * Get the public key from the blockchain
   */
  private async getPublicKey(): Promise<string> {
    // In production, this would fetch the public key from the KMS contract
    // For now, we'll use a placeholder
    return ''; // Will be fetched from blockchain
  }

  /**
   * Encrypt a value for use in a contract call
   *
   * @param input - The value and type to encrypt
   * @returns Encrypted bytes and signature for the contract
   */
  async encrypt(input: EncryptionInput): Promise<{
    data: Uint8Array;
    signature: string;
  }> {
    if (!this.instance || !this.keypair) {
      throw new Error('FHEVM instance not initialized. Call initialize() first.');
    }

    const userAddress = input.userAddress || (await this.config.signer?.getAddress());
    if (!userAddress) {
      throw new Error('User address required for encryption');
    }

    // Encrypt the input value
    const encrypted = this.instance.encrypt(
      BigInt(input.value),
      input.type
    );

    // Generate EIP-712 signature for access control
    const signature = await this.generateSignature(
      input.contractAddress,
      userAddress,
      encrypted
    );

    return {
      data: encrypted,
      signature,
    };
  }

  /**
   * Request decryption of encrypted contract outputs
   *
   * @param request - Contract address and handles to decrypt
   * @returns Promise that resolves with decrypted values
   */
  async decrypt(request: DecryptionRequest): Promise<bigint[]> {
    if (!this.instance || !this.keypair) {
      throw new Error('FHEVM instance not initialized. Call initialize() first.');
    }

    // Request decryption through Gateway API
    const results: bigint[] = [];

    for (const handle of request.handles) {
      try {
        const decrypted = await this.requestDecryption(
          request.contractAddress,
          handle
        );
        results.push(decrypted);
      } catch (error) {
        console.error(`Failed to decrypt handle ${handle}:`, error);
        results.push(BigInt(0)); // Fallback value
      }
    }

    return results;
  }

  /**
   * Request decryption of a single handle through Gateway API
   */
  private async requestDecryption(
    contractAddress: string,
    handle: string
  ): Promise<bigint> {
    if (!this.instance || !this.keypair) {
      throw new Error('FHEVM instance not initialized');
    }

    // This would call the Gateway API to decrypt the handle
    // For now, return a placeholder
    return BigInt(0);
  }

  /**
   * Generate EIP-712 signature for encrypted input
   */
  private async generateSignature(
    contractAddress: string,
    userAddress: string,
    encryptedData: Uint8Array
  ): Promise<string> {
    if (!this.config.signer) {
      throw new Error('Signer required for signature generation');
    }

    const domain = {
      name: 'FHEVMInputVerifier',
      version: '1',
      chainId: this.config.chainId,
      verifyingContract: contractAddress,
    };

    const types = {
      EncryptedInput: [
        { name: 'data', type: 'bytes' },
        { name: 'user', type: 'address' },
      ],
    };

    const value = {
      data: ethers.utils.hexlify(encryptedData),
      user: userAddress,
    };

    return await this.config.signer._signTypedData(domain, types, value);
  }

  /**
   * Create a reencryption request for viewing encrypted data
   *
   * @param contractAddress - Contract containing the encrypted data
   * @param handle - Handle to the encrypted data
   * @returns Signature for reencryption
   */
  async createReencryptionRequest(
    contractAddress: string,
    handle: string
  ): Promise<string> {
    if (!this.config.signer || !this.keypair) {
      throw new Error('Signer and keypair required for reencryption');
    }

    const userAddress = await this.config.signer.getAddress();

    const domain = {
      name: 'FHEVMReencryption',
      version: '1',
      chainId: this.config.chainId,
      verifyingContract: contractAddress,
    };

    const types = {
      Reencryption: [
        { name: 'publicKey', type: 'bytes' },
        { name: 'handle', type: 'bytes32' },
      ],
    };

    const value = {
      publicKey: this.keypair.publicKey,
      handle: handle,
    };

    return await this.config.signer._signTypedData(domain, types, value);
  }

  /**
   * Get the current instance (for advanced usage)
   */
  getInstance(): FhevmInstance | null {
    return this.instance;
  }

  /**
   * Check if the client is initialized
   */
  isInitialized(): boolean {
    return this.instance !== null && this.keypair !== null;
  }

  /**
   * Reset the client (useful for testing)
   */
  reset(): void {
    this.instance = null;
    this.keypair = null;
  }
}

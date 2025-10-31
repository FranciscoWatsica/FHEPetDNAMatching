/**
 * ContractHelpers - Utility functions for FHEVM contract interactions
 *
 * Provides high-level abstractions for common patterns:
 * - Contract deployment
 * - Encrypted function calls
 * - Event listening
 * - Gas estimation
 */

import { ethers } from 'ethers';
import { FHEVMClient, EncryptionInput } from './FHEVMClient';

export interface ContractConfig {
  address: string;
  abi: ethers.ContractInterface;
  client: FHEVMClient;
  signer: ethers.Signer;
}

export class FHEVMContract {
  private contract: ethers.Contract;
  private client: FHEVMClient;

  constructor(config: ContractConfig) {
    this.contract = new ethers.Contract(
      config.address,
      config.abi,
      config.signer
    );
    this.client = config.client;
  }

  /**
   * Call a contract function with encrypted inputs
   *
   * @param functionName - Name of the contract function
   * @param args - Function arguments (mix of plain and encrypted)
   * @param encryptedIndices - Indices of arguments that should be encrypted
   * @returns Transaction response
   */
  async callWithEncryption(
    functionName: string,
    args: any[],
    encryptedIndices: {
      index: number;
      type: EncryptionInput['type'];
    }[]
  ): Promise<ethers.ContractTransaction> {
    const processedArgs = [...args];

    // Encrypt specified arguments
    for (const { index, type } of encryptedIndices) {
      const value = args[index];
      const encrypted = await this.client.encrypt({
        value,
        type,
        contractAddress: this.contract.address,
      });

      // Replace argument with encrypted data
      processedArgs[index] = encrypted.data;
    }

    // Call the contract function
    return await this.contract[functionName](...processedArgs);
  }

  /**
   * Read encrypted data from contract with reencryption
   *
   * @param functionName - View function name
   * @param args - Function arguments
   * @param handle - Handle to encrypted data (returned by view function)
   * @returns Decrypted value
   */
  async viewWithDecryption(
    functionName: string,
    args: any[],
    handleIndex: number = 0
  ): Promise<bigint> {
    // Call view function to get handle
    const result = await this.contract[functionName](...args);
    const handle = Array.isArray(result) ? result[handleIndex] : result;

    // Request reencryption
    const signature = await this.client.createReencryptionRequest(
      this.contract.address,
      handle
    );

    // Decrypt the result
    const decrypted = await this.client.decrypt({
      contractAddress: this.contract.address,
      handles: [handle],
    });

    return decrypted[0];
  }

  /**
   * Listen for contract events
   *
   * @param eventName - Name of the event
   * @param callback - Function to call when event is emitted
   */
  on(eventName: string, callback: (...args: any[]) => void): void {
    this.contract.on(eventName, callback);
  }

  /**
   * Remove event listener
   *
   * @param eventName - Name of the event
   * @param callback - Callback to remove
   */
  off(eventName: string, callback?: (...args: any[]) => void): void {
    if (callback) {
      this.contract.off(eventName, callback);
    } else {
      this.contract.removeAllListeners(eventName);
    }
  }

  /**
   * Get the underlying ethers Contract instance
   */
  getContract(): ethers.Contract {
    return this.contract;
  }

  /**
   * Get contract address
   */
  getAddress(): string {
    return this.contract.address;
  }
}

/**
 * Helper to estimate gas for encrypted function calls
 */
export async function estimateEncryptedGas(
  contract: ethers.Contract,
  functionName: string,
  args: any[]
): Promise<ethers.BigNumber> {
  try {
    return await contract.estimateGas[functionName](...args);
  } catch (error) {
    // If estimation fails, use a default high value
    console.warn('Gas estimation failed, using default:', error);
    return ethers.BigNumber.from('500000');
  }
}

/**
 * Helper to wait for transaction confirmation with retry
 */
export async function waitForTransaction(
  tx: ethers.ContractTransaction,
  confirmations: number = 1,
  timeout: number = 120000
): Promise<ethers.ContractReceipt> {
  const receipt = await Promise.race([
    tx.wait(confirmations),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Transaction timeout')), timeout)
    ),
  ]);

  if (!receipt.status) {
    throw new Error('Transaction failed');
  }

  return receipt;
}

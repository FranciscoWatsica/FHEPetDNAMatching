/**
 * Utility helper functions for the SDK
 */

import { ethers } from 'ethers';
import { EncryptedType } from './types';

/**
 * Validate that a value fits within the specified encrypted type
 *
 * @param value - The value to validate
 * @param type - The encrypted type
 * @throws Error if value is out of range
 */
export function validateEncryptedValue(
  value: number | bigint,
  type: EncryptedType
): void {
  const numValue = BigInt(value);

  const maxValues: Record<EncryptedType, bigint> = {
    ebool: BigInt(1),
    euint8: BigInt(2 ** 8 - 1),
    euint16: BigInt(2 ** 16 - 1),
    euint32: BigInt(2 ** 32 - 1),
    euint64: BigInt(2 ** 64 - 1),
    euint128: BigInt(2 ** 128 - 1),
    euint256: BigInt(2 ** 256 - 1),
  };

  if (numValue < 0) {
    throw new Error(`Value cannot be negative: ${value}`);
  }

  if (numValue > maxValues[type]) {
    throw new Error(
      `Value ${value} exceeds maximum for ${type}: ${maxValues[type]}`
    );
  }
}

/**
 * Convert encrypted bytes to hex string
 *
 * @param data - Encrypted data bytes
 * @returns Hex string representation
 */
export function toHexString(data: Uint8Array): string {
  return ethers.utils.hexlify(data);
}

/**
 * Convert hex string to bytes
 *
 * @param hex - Hex string
 * @returns Uint8Array
 */
export function fromHexString(hex: string): Uint8Array {
  return ethers.utils.arrayify(hex);
}

/**
 * Format a large number for display
 *
 * @param value - The value to format
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatEncryptedValue(
  value: bigint,
  decimals: number = 0
): string {
  if (decimals === 0) {
    return value.toString();
  }

  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const fraction = value % divisor;

  return `${whole}.${fraction.toString().padStart(decimals, '0')}`;
}

/**
 * Sleep for a specified duration (useful for polling)
 *
 * @param ms - Duration in milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - Function to retry
 * @param maxAttempts - Maximum number of attempts
 * @param initialDelay - Initial delay in milliseconds
 * @returns Result of the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts - 1) {
        const delay = initialDelay * 2 ** attempt;
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Check if a value is a valid Ethereum address
 *
 * @param address - Address to check
 * @returns True if valid
 */
export function isValidAddress(address: string): boolean {
  return ethers.utils.isAddress(address);
}

/**
 * Shorten an address for display
 *
 * @param address - Full address
 * @param startChars - Characters to show at start
 * @param endChars - Characters to show at end
 * @returns Shortened address
 */
export function shortenAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!isValidAddress(address)) {
    return address;
  }

  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Parse error message from contract call
 *
 * @param error - Error object
 * @returns Human-readable error message
 */
export function parseContractError(error: any): string {
  if (error.reason) {
    return error.reason;
  }

  if (error.message) {
    // Extract revert reason if available
    const match = error.message.match(/reason="([^"]+)"/);
    if (match) {
      return match[1];
    }
    return error.message;
  }

  return 'Unknown error occurred';
}

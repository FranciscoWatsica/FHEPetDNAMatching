/**
 * useEncrypt Hook
 *
 * React hook for encrypting values with FHEVM
 */

import { useState, useCallback } from 'react';
import { FHEVMClient, EncryptionInput } from '../core/FHEVMClient';

export interface UseEncryptReturn {
  encrypt: (input: EncryptionInput) => Promise<{
    data: Uint8Array;
    signature: string;
  }>;
  isEncrypting: boolean;
  error: Error | null;
  lastResult: {
    data: Uint8Array;
    signature: string;
  } | null;
}

export function useEncrypt(client: FHEVMClient | null): UseEncryptReturn {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<{
    data: Uint8Array;
    signature: string;
  } | null>(null);

  const encrypt = useCallback(
    async (input: EncryptionInput) => {
      if (!client) {
        throw new Error('FHEVM client not initialized');
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const result = await client.encrypt(input);
        setLastResult(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsEncrypting(false);
      }
    },
    [client]
  );

  return {
    encrypt,
    isEncrypting,
    error,
    lastResult,
  };
}

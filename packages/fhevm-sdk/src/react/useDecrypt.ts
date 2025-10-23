/**
 * useDecrypt Hook
 *
 * React hook for decrypting FHEVM encrypted data
 */

import { useState, useCallback } from 'react';
import { FHEVMClient, DecryptionRequest } from '../core/FHEVMClient';

export interface UseDecryptReturn {
  decrypt: (request: DecryptionRequest) => Promise<bigint[]>;
  isDecrypting: boolean;
  error: Error | null;
  lastResults: bigint[] | null;
}

export function useDecrypt(client: FHEVMClient | null): UseDecryptReturn {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResults, setLastResults] = useState<bigint[] | null>(null);

  const decrypt = useCallback(
    async (request: DecryptionRequest) => {
      if (!client) {
        throw new Error('FHEVM client not initialized');
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const results = await client.decrypt(request);
        setLastResults(results);
        return results;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsDecrypting(false);
      }
    },
    [client]
  );

  return {
    decrypt,
    isDecrypting,
    error,
    lastResults,
  };
}

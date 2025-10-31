/**
 * useDecrypt Composable for Vue 3
 */

import { ref, Ref } from 'vue';
import { FHEVMClient, DecryptionRequest } from '../core/FHEVMClient';

export function useDecrypt(client: Ref<FHEVMClient | null>) {
  const isDecrypting = ref(false);
  const error = ref<Error | null>(null);
  const lastResults = ref<bigint[] | null>(null);

  async function decrypt(request: DecryptionRequest) {
    if (!client.value) {
      throw new Error('FHEVM client not initialized');
    }

    isDecrypting.value = true;
    error.value = null;

    try {
      const results = await client.value.decrypt(request);
      lastResults.value = results;
      return results;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      isDecrypting.value = false;
    }
  }

  return {
    decrypt,
    isDecrypting,
    error,
    lastResults,
  };
}

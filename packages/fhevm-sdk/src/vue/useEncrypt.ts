/**
 * useEncrypt Composable for Vue 3
 */

import { ref, Ref } from 'vue';
import { FHEVMClient, EncryptionInput } from '../core/FHEVMClient';

export function useEncrypt(client: Ref<FHEVMClient | null>) {
  const isEncrypting = ref(false);
  const error = ref<Error | null>(null);
  const lastResult = ref<{ data: Uint8Array; signature: string } | null>(null);

  async function encrypt(input: EncryptionInput) {
    if (!client.value) {
      throw new Error('FHEVM client not initialized');
    }

    isEncrypting.value = true;
    error.value = null;

    try {
      const result = await client.value.encrypt(input);
      lastResult.value = result;
      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      isEncrypting.value = false;
    }
  }

  return {
    encrypt,
    isEncrypting,
    error,
    lastResult,
  };
}

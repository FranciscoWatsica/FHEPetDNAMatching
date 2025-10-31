/**
 * Vue 3 Composables for FHEVM SDK
 *
 * Provides Vue-specific abstractions using Composition API
 *
 * @example
 * ```vue
 * <script setup>
 * import { useFHEVM, useEncrypt } from '@fhevm-pet-dna/sdk/vue';
 *
 * const { client, isInitialized } = useFHEVM({
 *   chainId: 11155111,
 * });
 *
 * const { encrypt, isEncrypting } = useEncrypt(client);
 *
 * async function handleEncrypt() {
 *   const result = await encrypt({
 *     value: 42,
 *     type: 'euint8',
 *     contractAddress: '0x...',
 *   });
 * }
 * </script>
 * ```
 */

export { useFHEVM } from './useFHEVM';
export { useEncrypt } from './useEncrypt';
export { useDecrypt } from './useDecrypt';
export { useFHEVMContract } from './useFHEVMContract';

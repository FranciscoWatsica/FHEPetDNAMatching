/**
 * React hooks for FHEVM SDK
 *
 * Provides React-specific abstractions:
 * - useFHEVM: Main hook for FHEVM client
 * - useEncrypt: Hook for encrypting values
 * - useDecrypt: Hook for decrypting values
 * - useFHEVMContract: Hook for contract interactions
 *
 * @example
 * ```tsx
 * import { useFHEVM, useEncrypt } from '@fhevm-pet-dna/sdk/react';
 *
 * function MyComponent() {
 *   const { client, isInitialized } = useFHEVM({
 *     chainId: 11155111,
 *   });
 *
 *   const { encrypt, isEncrypting } = useEncrypt(client);
 *
 *   const handleEncrypt = async () => {
 *     const result = await encrypt({
 *       value: 42,
 *       type: 'euint8',
 *       contractAddress: '0x...',
 *     });
 *   };
 *
 *   return <button onClick={handleEncrypt}>Encrypt</button>;
 * }
 * ```
 */

export { useFHEVM } from './useFHEVM';
export { useEncrypt } from './useEncrypt';
export { useDecrypt } from './useDecrypt';
export { useFHEVMContract } from './useFHEVMContract';
export { FHEVMProvider, useFHEVMContext } from './FHEVMContext';

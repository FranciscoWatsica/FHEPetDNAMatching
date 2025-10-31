/**
 * FHEVMContext
 *
 * React Context for sharing FHEVM client across components
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { UseFHEVMConfig, UseFHEVMReturn, useFHEVM } from './useFHEVM';

const FHEVMContext = createContext<UseFHEVMReturn | null>(null);

export interface FHEVMProviderProps extends UseFHEVMConfig {
  children: ReactNode;
}

/**
 * Provider component for FHEVM context
 *
 * @example
 * ```tsx
 * <FHEVMProvider chainId={11155111} autoInitialize>
 *   <App />
 * </FHEVMProvider>
 * ```
 */
export function FHEVMProvider({ children, ...config }: FHEVMProviderProps) {
  const fhevm = useFHEVM(config);

  return <FHEVMContext.Provider value={fhevm}>{children}</FHEVMContext.Provider>;
}

/**
 * Hook to access FHEVM context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { client, isInitialized } = useFHEVMContext();
 *
 *   if (!isInitialized) {
 *     return <div>Initializing...</div>;
 *   }
 *
 *   return <div>Ready!</div>;
 * }
 * ```
 */
export function useFHEVMContext(): UseFHEVMReturn {
  const context = useContext(FHEVMContext);

  if (!context) {
    throw new Error('useFHEVMContext must be used within FHEVMProvider');
  }

  return context;
}

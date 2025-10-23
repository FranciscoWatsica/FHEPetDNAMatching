/**
 * useFHEVM Hook
 *
 * Main React hook for initializing and managing FHEVM client
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { FHEVMClient, FHEVMClientConfig } from '../core/FHEVMClient';
import { InitializationStatus } from '../utils/types';

export interface UseFHEVMConfig {
  provider?: ethers.providers.Provider;
  signer?: ethers.Signer;
  chainId: number;
  gatewayUrl?: string;
  autoInitialize?: boolean;
}

export interface UseFHEVMReturn {
  client: FHEVMClient | null;
  isInitialized: boolean;
  isInitializing: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
  reset: () => void;
  status: InitializationStatus;
}

export function useFHEVM(config: UseFHEVMConfig): UseFHEVMReturn {
  const [client, setClient] = useState<FHEVMClient | null>(null);
  const [status, setStatus] = useState<InitializationStatus>(
    InitializationStatus.NOT_INITIALIZED
  );
  const [error, setError] = useState<Error | null>(null);
  const clientRef = useRef<FHEVMClient | null>(null);

  // Initialize client
  const initialize = useCallback(async () => {
    if (status === InitializationStatus.INITIALIZING ||
        status === InitializationStatus.INITIALIZED) {
      return;
    }

    setStatus(InitializationStatus.INITIALIZING);
    setError(null);

    try {
      // Get provider and signer
      let provider = config.provider;
      let signer = config.signer;

      if (!provider && typeof window !== 'undefined' && window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
      }

      if (!provider) {
        throw new Error('No provider available. Please connect your wallet.');
      }

      // Create client config
      const clientConfig: FHEVMClientConfig = {
        provider,
        signer,
        chainId: config.chainId,
        gatewayUrl: config.gatewayUrl,
      };

      // Create and initialize client
      const newClient = new FHEVMClient(clientConfig);
      await newClient.initialize();

      clientRef.current = newClient;
      setClient(newClient);
      setStatus(InitializationStatus.INITIALIZED);
    } catch (err) {
      const error = err as Error;
      setError(error);
      setStatus(InitializationStatus.ERROR);
      console.error('Failed to initialize FHEVM client:', error);
    }
  }, [config, status]);

  // Reset client
  const reset = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.reset();
    }
    setClient(null);
    setStatus(InitializationStatus.NOT_INITIALIZED);
    setError(null);
  }, []);

  // Auto-initialize if requested
  useEffect(() => {
    if (config.autoInitialize !== false && status === InitializationStatus.NOT_INITIALIZED) {
      initialize();
    }
  }, [config.autoInitialize, initialize, status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.reset();
      }
    };
  }, []);

  return {
    client,
    isInitialized: status === InitializationStatus.INITIALIZED,
    isInitializing: status === InitializationStatus.INITIALIZING,
    error,
    initialize,
    reset,
    status,
  };
}

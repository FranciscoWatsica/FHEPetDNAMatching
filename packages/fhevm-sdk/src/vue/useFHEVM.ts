/**
 * useFHEVM Composable for Vue 3
 */

import { ref, onMounted, onUnmounted, computed } from 'vue';
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

export function useFHEVM(config: UseFHEVMConfig) {
  const client = ref<FHEVMClient | null>(null);
  const status = ref<InitializationStatus>(InitializationStatus.NOT_INITIALIZED);
  const error = ref<Error | null>(null);

  const isInitialized = computed(() => status.value === InitializationStatus.INITIALIZED);
  const isInitializing = computed(() => status.value === InitializationStatus.INITIALIZING);

  async function initialize() {
    if (status.value === InitializationStatus.INITIALIZING ||
        status.value === InitializationStatus.INITIALIZED) {
      return;
    }

    status.value = InitializationStatus.INITIALIZING;
    error.value = null;

    try {
      let provider = config.provider;
      let signer = config.signer;

      if (!provider && typeof window !== 'undefined' && (window as any).ethereum) {
        provider = new ethers.providers.Web3Provider((window as any).ethereum);
        signer = provider.getSigner();
      }

      if (!provider) {
        throw new Error('No provider available');
      }

      const clientConfig: FHEVMClientConfig = {
        provider,
        signer,
        chainId: config.chainId,
        gatewayUrl: config.gatewayUrl,
      };

      const newClient = new FHEVMClient(clientConfig);
      await newClient.initialize();

      client.value = newClient;
      status.value = InitializationStatus.INITIALIZED;
    } catch (err) {
      error.value = err as Error;
      status.value = InitializationStatus.ERROR;
    }
  }

  function reset() {
    if (client.value) {
      client.value.reset();
    }
    client.value = null;
    status.value = InitializationStatus.NOT_INITIALIZED;
    error.value = null;
  }

  onMounted(() => {
    if (config.autoInitialize !== false) {
      initialize();
    }
  });

  onUnmounted(() => {
    reset();
  });

  return {
    client,
    isInitialized,
    isInitializing,
    error,
    status,
    initialize,
    reset,
  };
}

/**
 * useFHEVMContract Composable for Vue 3
 */

import { ref, computed, Ref } from 'vue';
import { ethers } from 'ethers';
import { FHEVMClient } from '../core/FHEVMClient';
import { FHEVMContract, ContractConfig } from '../core/ContractHelpers';

export interface UseFHEVMContractConfig {
  address: string;
  abi: ethers.ContractInterface;
  client: Ref<FHEVMClient | null>;
  signer: Ref<ethers.Signer | null>;
}

export function useFHEVMContract(config: UseFHEVMContractConfig) {
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  const contract = computed(() => {
    if (!config.client.value || !config.signer.value) {
      return null;
    }

    try {
      const contractConfig: ContractConfig = {
        address: config.address,
        abi: config.abi,
        client: config.client.value,
        signer: config.signer.value,
      };

      return new FHEVMContract(contractConfig);
    } catch (err) {
      console.error('Failed to create contract:', err);
      return null;
    }
  });

  async function call(
    functionName: string,
    args: any[],
    encryptedIndices: { index: number; type: any }[] = []
  ) {
    if (!contract.value) {
      throw new Error('Contract not initialized');
    }

    isLoading.value = true;
    error.value = null;

    try {
      const tx = await contract.value.callWithEncryption(
        functionName,
        args,
        encryptedIndices
      );
      return tx;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function view(functionName: string, args: any[]) {
    if (!contract.value) {
      throw new Error('Contract not initialized');
    }

    isLoading.value = true;
    error.value = null;

    try {
      const ethersContract = contract.value.getContract();
      const result = await ethersContract[functionName](...args);
      return result;
    } catch (err) {
      error.value = err as Error;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    contract,
    call,
    view,
    isLoading,
    error,
  };
}

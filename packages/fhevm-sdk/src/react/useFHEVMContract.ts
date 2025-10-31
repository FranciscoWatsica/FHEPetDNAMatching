/**
 * useFHEVMContract Hook
 *
 * React hook for interacting with FHEVM contracts
 */

import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { FHEVMClient } from '../core/FHEVMClient';
import { FHEVMContract, ContractConfig } from '../core/ContractHelpers';

export interface UseFHEVMContractConfig {
  address: string;
  abi: ethers.ContractInterface;
  client: FHEVMClient | null;
  signer: ethers.Signer | null;
}

export interface UseFHEVMContractReturn {
  contract: FHEVMContract | null;
  call: (
    functionName: string,
    args: any[],
    encryptedIndices?: { index: number; type: any }[]
  ) => Promise<ethers.ContractTransaction>;
  view: (
    functionName: string,
    args: any[]
  ) => Promise<any>;
  isLoading: boolean;
  error: Error | null;
}

export function useFHEVMContract(
  config: UseFHEVMContractConfig
): UseFHEVMContractReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create contract instance
  const contract = useMemo(() => {
    if (!config.client || !config.signer) {
      return null;
    }

    try {
      const contractConfig: ContractConfig = {
        address: config.address,
        abi: config.abi,
        client: config.client,
        signer: config.signer,
      };

      return new FHEVMContract(contractConfig);
    } catch (err) {
      console.error('Failed to create contract:', err);
      return null;
    }
  }, [config.address, config.abi, config.client, config.signer]);

  // Call contract function with encryption
  const call = useCallback(
    async (
      functionName: string,
      args: any[],
      encryptedIndices: { index: number; type: any }[] = []
    ) => {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      setIsLoading(true);
      setError(null);

      try {
        const tx = await contract.callWithEncryption(
          functionName,
          args,
          encryptedIndices
        );
        return tx;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  // View contract function
  const view = useCallback(
    async (functionName: string, args: any[]) => {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      setIsLoading(true);
      setError(null);

      try {
        const ethersContract = contract.getContract();
        const result = await ethersContract[functionName](...args);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  return {
    contract,
    call,
    view,
    isLoading,
    error,
  };
}

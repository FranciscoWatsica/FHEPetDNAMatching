import React, { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '../utils/fhevm';

const ContractInfo = ({ contract, onSuccess, onError }) => {
  const [info, setInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadInfo = async () => {
    if (!contract) {
      onError && onError('Please connect wallet first');
      return;
    }

    try {
      setIsLoading(true);

      const totalPets = await contract.getTotalPets();
      const matchingCost = await contract.matchingCost();
      const owner = await contract.owner();

      setInfo({
        totalPets: totalPets.toString(),
        matchingCost: ethers.utils.formatEther(matchingCost),
        owner
      });

      onSuccess && onSuccess('Contract information loaded');

    } catch (error) {
      console.error('Failed to load contract info:', error);
      onError && onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>📊 Contract Information</h2>
      <button
        className="btn btn-secondary"
        onClick={loadInfo}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Load Contract Info'}
      </button>
      {info && (
        <div style={{ marginTop: '15px', background: '#f8f9fa', padding: '15px', borderRadius: '10px' }}>
          <p><strong>Contract Address:</strong> <code>{CONTRACT_ADDRESS}</code></p>
          <p><strong>Total Pets Registered:</strong> {info.totalPets}</p>
          <p><strong>Matching Cost:</strong> {info.matchingCost} ETH</p>
          <p><strong>Contract Owner:</strong> <code>{info.owner}</code></p>
          <p><strong>Network:</strong> Sepolia Testnet</p>
          <p><strong>Gateway:</strong> API v2.0+ Compatible ✅</p>
        </div>
      )}
    </div>
  );
};

export default ContractInfo;

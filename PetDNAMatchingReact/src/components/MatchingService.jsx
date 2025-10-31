import React, { useState } from 'react';
import { ethers } from 'ethers';

const MatchingService = ({ contract, pets, onSuccess, onError }) => {
  const [petId1, setPetId1] = useState('');
  const [petId2, setPetId2] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState([]);

  const requestMatching = async () => {
    if (!contract) {
      onError && onError('Please connect wallet first');
      return;
    }

    if (!petId1 || !petId2) {
      onError && onError('Please select both pets');
      return;
    }

    try {
      setIsMatching(true);

      const matchingCost = await contract.matchingCost();

      const tx = await contract.requestMatching(petId1, petId2, {
        value: matchingCost
      });

      onSuccess && onSuccess('Matching request sent, waiting for confirmation...');

      const receipt = await tx.wait();
      onSuccess && onSuccess('Matching confirmed! Waiting for Gateway to process...');

      // Listen for matching result
      contract.once('MatchingCompleted', (p1, p2, score) => {
        if (p1.toString() === petId1 && p2.toString() === petId2) {
          setMatchResults(prev => [...prev, {
            petId1: petId1,
            petId2: petId2,
            score: score.toString()
          }]);
          onSuccess && onSuccess('Matching completed!');
        }
      });

    } catch (error) {
      console.error('Matching failed:', error);
      onError && onError(error.reason || error.message);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="card">
      <h2>💕 Matching Service</h2>
      <p style={{ marginBottom: '15px' }}>Select two pets to request compatibility matching (Cost: 0.001 ETH)</p>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="matchPet1">Your Pet</label>
          <select
            id="matchPet1"
            value={petId1}
            onChange={(e) => setPetId1(e.target.value)}
          >
            <option value="">Select your pet</option>
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>
                #{pet.id} - {pet.info.name} ({pet.info.breed})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="matchPet2">Match With Pet ID</label>
          <input
            type="number"
            id="matchPet2"
            placeholder="Enter pet ID to match with"
            min="1"
            value={petId2}
            onChange={(e) => setPetId2(e.target.value)}
          />
        </div>
      </div>
      <button
        className="btn btn-success"
        onClick={requestMatching}
        disabled={isMatching}
      >
        {isMatching ? 'Processing...' : 'Request Matching (0.001 ETH)'}
      </button>

      <div style={{ marginTop: '20px' }}>
        {matchResults.map((result, index) => (
          <div key={index} className="match-result">
            <h3>🎉 Matching Complete!</h3>
            <p><strong>Pet #{result.petId1}</strong> matched with <strong>Pet #{result.petId2}</strong></p>
            <div className="compatibility-score">{result.score}/100</div>
            <p>Compatibility score (higher is better for breeding)</p>
            <p style={{ fontSize: '0.9em', marginTop: '10px' }}>
              <strong>Note:</strong> All genetic data remains encrypted throughout the matching process.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchingService;

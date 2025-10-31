'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Contract configuration
const CONTRACT_ADDRESS = '0xC16ebe7Cb0A3B057437B8A3568d6Df2FB02812d1';
const CONTRACT_ABI = [
  "function registerPet(string _name, string _species, string _breed, uint256 _birthYear, uint8 _healthScore, uint16 _geneticMarker1, uint16 _geneticMarker2, uint16 _geneticMarker3, uint8 _temperament) external",
  "function createMatchingProfile(uint256 _petId, uint8 _minHealthScore, uint8 _temperamentPreference, uint256 _maxAge) external",
  "function requestMatching(uint256 _petId1, uint256 _petId2) external payable",
  "function getPetInfo(uint256 _petId) external view returns (string name, string species, string breed, uint256 birthYear, address petOwner, bool availableForBreeding)",
  "function getOwnerPets(address _owner) external view returns (uint256[] memory)",
  "function getPetMatches(uint256 _petId) external view returns (tuple(uint256 requestId, uint256 petId1, uint256 petId2, uint8 compatibilityScore, bool isMatched, uint256 matchTime)[] memory)",
  "function getTotalPets() external view returns (uint256)",
  "event PetRegistered(uint256 indexed petId, address indexed owner, string name)"
];

export default function Home() {
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [status, setStatus] = useState<{ type: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [healthRisk, setHealthRisk] = useState('');
  const [marker1, setMarker1] = useState('');
  const [marker2, setMarker2] = useState('');
  const [marker3, setMarker3] = useState('');
  const [marker4, setMarker4] = useState('');

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setStatus({ type: 'error', message: 'MetaMask not detected! Please install MetaMask.' });
        return;
      }

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await web3Provider.send('eth_requestAccounts', []);
      const signer = web3Provider.getSigner();
      const petContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setProvider(web3Provider);
      setAccount(accounts[0]);
      setContract(petContract);
      setStatus({ type: 'success', message: `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}` });

      // Check network
      const network = await web3Provider.getNetwork();
      if (network.chainId !== 11155111) {
        setStatus({ type: 'warning', message: 'Please switch to Sepolia testnet' });
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      setStatus({ type: 'error', message: `Connection failed: ${error.message}` });
    }
  };

  // Register pet
  const registerPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) {
      setStatus({ type: 'error', message: 'Please connect wallet first' });
      return;
    }

    setLoading(true);
    try {
      const currentYear = 2024;
      const birthYear = currentYear - parseInt(age);
      const temperament = parseInt(marker4) % 10 + 1;
      const healthScore = 100 - parseInt(healthRisk);
      const species = 'Dog';

      const tx = await contract.registerPet(
        petName,
        species,
        breed,
        birthYear,
        healthScore,
        parseInt(marker1),
        parseInt(marker2),
        parseInt(marker3),
        temperament
      );

      setStatus({ type: 'warning', message: 'Transaction submitted. Waiting for confirmation...' });
      await tx.wait();

      setStatus({ type: 'success', message: `Pet "${petName}" registered successfully!` });

      // Reset form
      setPetName('');
      setBreed('');
      setAge('');
      setHealthRisk('');
      setMarker1('');
      setMarker2('');
      setMarker3('');
      setMarker4('');
    } catch (error: any) {
      console.error('Registration error:', error);
      setStatus({ type: 'error', message: `Registration failed: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🐾 Privacy Pet DNA Matching</h1>
        <p>Privacy-preserving pet breeding compatibility matching with encrypted genetic data</p>
      </div>

      {!account ? (
        <div style={{ textAlign: 'center' }}>
          <button className="button" onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          {status && (
            <div className={`status ${status.type}`}>
              {status.message}
            </div>
          )}

          <div className="card">
            <h2>Register Your Pet</h2>
            <form onSubmit={registerPet}>
              <div className="form-group">
                <label>Pet Name *</label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="e.g., Max"
                  required
                />
              </div>

              <div className="form-group">
                <label>Breed *</label>
                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="e.g., Golden Retriever"
                  required
                />
              </div>

              <div className="form-group">
                <label>Age (years) *</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g., 3"
                  min="0"
                  max="20"
                  required
                />
              </div>

              <div className="form-group">
                <label>Health Risk Score (0-100, lower is better) *</label>
                <input
                  type="number"
                  value={healthRisk}
                  onChange={(e) => setHealthRisk(e.target.value)}
                  placeholder="e.g., 15"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div className="grid">
                <div className="form-group">
                  <label>Genetic Marker 1 (0-65535) *</label>
                  <input
                    type="number"
                    value={marker1}
                    onChange={(e) => setMarker1(e.target.value)}
                    placeholder="e.g., 12345"
                    min="0"
                    max="65535"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Genetic Marker 2 (0-65535) *</label>
                  <input
                    type="number"
                    value={marker2}
                    onChange={(e) => setMarker2(e.target.value)}
                    placeholder="e.g., 54321"
                    min="0"
                    max="65535"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Genetic Marker 3 (0-65535) *</label>
                  <input
                    type="number"
                    value={marker3}
                    onChange={(e) => setMarker3(e.target.value)}
                    placeholder="e.g., 23456"
                    min="0"
                    max="65535"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Genetic Marker 4 (0-65535) *</label>
                  <input
                    type="number"
                    value={marker4}
                    onChange={(e) => setMarker4(e.target.value)}
                    placeholder="e.g., 65432"
                    min="0"
                    max="65535"
                    required
                  />
                </div>
              </div>

              <button className="button" type="submit" disabled={loading}>
                {loading ? <span className="loading"></span> : 'Register Pet'}
              </button>
            </form>
          </div>

          <div className="card">
            <h3>📡 Contract Information</h3>
            <p><strong>Network:</strong> Ethereum Sepolia Testnet</p>
            <p><strong>Contract:</strong> <code>{CONTRACT_ADDRESS}</code></p>
            <p><strong>Chain ID:</strong> 11155111</p>
            <p><strong>Your Account:</strong> <code>{account}</code></p>
          </div>
        </>
      )}
    </div>
  );
}

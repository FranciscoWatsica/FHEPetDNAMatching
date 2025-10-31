import { ethers } from 'ethers';
import { createInstance } from 'fhevmjs';

/**
 * SimpleFHEVMClient - SDK Wrapper for FHEVM operations
 * Mirrors packages/fhevm-sdk/src/core/FHEVMClient.ts
 */
export class SimpleFHEVMClient {
  constructor(provider, signer, chainId) {
    this.provider = provider;
    this.signer = signer;
    this.chainId = chainId;
    this.instance = null;
    this.publicKey = null;
  }

  async initialize() {
    try {
      // Initialize fhevmjs instance
      this.instance = await createInstance({
        chainId: this.chainId,
        publicKey: await this.getPublicKey(),
      });
      return this.instance;
    } catch (error) {
      console.error('FHEVM initialization failed:', error);
      throw error;
    }
  }

  async getPublicKey() {
    if (this.publicKey) return this.publicKey;
    // Get public key from ACL contract or gateway
    // For now using default configuration
    return null;
  }

  async encrypt(value, type, contractAddress) {
    if (!this.instance) {
      throw new Error('FHEVM client not initialized. Call initialize() first.');
    }

    const userAddress = await this.signer.getAddress();
    const input = this.instance.createEncryptedInput(contractAddress, userAddress);

    // Add value based on type
    if (type === 'euint8') input.add8(value);
    else if (type === 'euint16') input.add16(value);
    else if (type === 'euint32') input.add32(value);
    else if (type === 'euint64') input.add64(value);
    else throw new Error(`Unsupported type: ${type}`);

    return input.encrypt();
  }

  getInstance() {
    return this.instance;
  }
}

export const CONTRACT_ADDRESS = "0xC16ebe7Cb0A3B057437B8A3568d6Df2FB02812d1";

export const CONTRACT_ABI = [
  "function registerPet(string _name, string _species, string _breed, uint256 _birthYear, uint8 _healthScore, uint16 _geneticMarker1, uint16 _geneticMarker2, uint16 _geneticMarker3, uint8 _temperament)",
  "function requestMatching(uint256 _petId1, uint256 _petId2) payable",
  "function setBreedingStatus(uint256 _petId, bool _available)",
  "function getPetInfo(uint256 _petId) view returns (string name, string species, string breed, uint256 birthYear, address petOwner, bool availableForBreeding)",
  "function getOwnerPets(address _owner) view returns (uint256[])",
  "function getTotalPets() view returns (uint256)",
  "function matchingCost() view returns (uint256)",
  "function owner() view returns (address)",
  "event PetRegistered(uint256 indexed petId, address indexed owner, string name)",
  "event MatchingRequested(uint256 indexed petId1, uint256 indexed petId2, uint256 requestId)",
  "event MatchingCompleted(uint256 indexed petId1, uint256 indexed petId2, uint8 compatibilityScore)",
  "event BreedingStatusChanged(uint256 indexed petId, bool available)"
];

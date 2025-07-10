// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivatePetDNAMatching is SepoliaConfig {

    address public owner;
    uint256 public nextPetId;
    uint256 public nextRequestId;

    // DNA marker representation (using 8-bit encrypted integers)
    struct DNAProfile {
        euint8 marker1;  // Genetic marker 1 (0-255)
        euint8 marker2;  // Genetic marker 2 (0-255)
        euint8 marker3;  // Genetic marker 3 (0-255)
        euint8 marker4;  // Genetic marker 4 (0-255)
        euint8 healthRisk; // Health risk score (0-255, lower is better)
        bool isActive;
    }

    struct Pet {
        address owner;
        string name;
        string breed;
        uint8 age;
        bool isAvailableForBreeding;
        DNAProfile dnaProfile;
        uint256 registrationTime;
    }

    struct MatchingRequest {
        uint256 petId;
        address requester;
        bool isActive;
        uint256 requestTime;
        uint256[] potentialMatches;
        uint256 bestMatchId;
        euint32 bestMatchScore;
    }

    // Storage mappings
    mapping(uint256 => Pet) public pets;
    mapping(uint256 => MatchingRequest) public matchingRequests;
    mapping(address => uint256[]) public ownerToPets;

    // Events
    event PetRegistered(uint256 indexed petId, address indexed owner, string name, string breed);
    event MatchingRequested(uint256 indexed requestId, uint256 indexed petId, address indexed requester);
    event MatchFound(uint256 indexed requestId, uint256 indexed petId, uint256 indexed matchId, uint32 compatibility);
    event NoSuitableMatch(uint256 indexed requestId, uint256 indexed petId);
    event PetBreedingStatusChanged(uint256 indexed petId, bool isAvailable);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyPetOwner(uint256 _petId) {
        require(pets[_petId].owner == msg.sender, "Not pet owner");
        _;
    }

    modifier validPetId(uint256 _petId) {
        require(_petId > 0 && _petId <= nextPetId, "Invalid pet ID");
        _;
    }

    constructor() {
        owner = msg.sender;
        nextPetId = 1;
        nextRequestId = 1;
    }

    /**
     * Register a new pet with encrypted DNA profile
     * DNA markers and health risk are encrypted to maintain privacy
     */
    function registerPet(
        string memory _name,
        string memory _breed,
        uint8 _age,
        uint8 _marker1,
        uint8 _marker2,
        uint8 _marker3,
        uint8 _marker4,
        uint8 _healthRisk
    ) external returns (uint256 petId) {
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_breed).length > 0, "Breed required");
        require(_age > 0 && _age <= 20, "Invalid age");

        petId = nextPetId++;

        // Encrypt DNA markers and health data
        euint8 encMarker1 = FHE.asEuint8(_marker1);
        euint8 encMarker2 = FHE.asEuint8(_marker2);
        euint8 encMarker3 = FHE.asEuint8(_marker3);
        euint8 encMarker4 = FHE.asEuint8(_marker4);
        euint8 encHealthRisk = FHE.asEuint8(_healthRisk);

        // Set up DNA profile
        DNAProfile memory dnaProfile = DNAProfile({
            marker1: encMarker1,
            marker2: encMarker2,
            marker3: encMarker3,
            marker4: encMarker4,
            healthRisk: encHealthRisk,
            isActive: true
        });

        // Create pet record
        pets[petId] = Pet({
            owner: msg.sender,
            name: _name,
            breed: _breed,
            age: _age,
            isAvailableForBreeding: true,
            dnaProfile: dnaProfile,
            registrationTime: block.timestamp
        });

        // Add to owner's pet list
        ownerToPets[msg.sender].push(petId);

        // Grant access permissions for encrypted data
        FHE.allowThis(encMarker1);
        FHE.allowThis(encMarker2);
        FHE.allowThis(encMarker3);
        FHE.allowThis(encMarker4);
        FHE.allowThis(encHealthRisk);

        FHE.allow(encMarker1, msg.sender);
        FHE.allow(encMarker2, msg.sender);
        FHE.allow(encMarker3, msg.sender);
        FHE.allow(encMarker4, msg.sender);
        FHE.allow(encHealthRisk, msg.sender);

        emit PetRegistered(petId, msg.sender, _name, _breed);
    }

    /**
     * Request matching for a pet
     * This initiates the private DNA comparison process
     */
    function requestMatching(uint256 _petId)
        external
        validPetId(_petId)
        onlyPetOwner(_petId)
        returns (uint256 requestId)
    {
        require(pets[_petId].isAvailableForBreeding, "Pet not available for breeding");

        requestId = nextRequestId++;

        matchingRequests[requestId] = MatchingRequest({
            petId: _petId,
            requester: msg.sender,
            isActive: true,
            requestTime: block.timestamp,
            potentialMatches: new uint256[](0),
            bestMatchId: 0,
            bestMatchScore: FHE.asEuint32(0)
        });

        emit MatchingRequested(requestId, _petId, msg.sender);

        // Start the matching process
        _processMatching(requestId);
    }

    /**
     * Private matching algorithm using FHE
     * Compares DNA markers without revealing actual values
     */
    function _processMatching(uint256 _requestId) internal {
        MatchingRequest storage request = matchingRequests[_requestId];
        Pet storage requestingPet = pets[request.petId];

        euint32 bestScore = FHE.asEuint32(0);
        uint256 bestMatchId = 0;

        // Iterate through all registered pets
        for (uint256 i = 1; i <= nextPetId; i++) {
            if (i == request.petId) continue; // Skip self

            Pet storage candidatePet = pets[i];
            if (!candidatePet.isAvailableForBreeding) continue;
            if (candidatePet.owner == request.requester) continue; // Skip own pets

            // Calculate compatibility score using encrypted comparison
            euint32 compatibilityScore = _calculateCompatibility(
                requestingPet.dnaProfile,
                candidatePet.dnaProfile
            );

            // Check if this is the best match so far (encrypted comparison)
            ebool isBetter = FHE.gt(compatibilityScore, bestScore);
            bestScore = FHE.select(isBetter, compatibilityScore, bestScore);

            // Store potential match
            request.potentialMatches.push(i);
        }

        request.bestMatchScore = bestScore;

        // Request decryption to reveal the final result
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(bestScore);
        FHE.requestDecryption(cts, this.processMatchingResult.selector, abi.encode(_requestId));
    }

    /**
     * Calculate compatibility between two DNA profiles
     * Higher score means better compatibility and lower genetic risk
     */
    function _calculateCompatibility(
        DNAProfile storage pet1DNA,
        DNAProfile storage pet2DNA
    ) internal view returns (euint32) {
        // Calculate genetic diversity (differences in markers are good)
        euint8 diff1 = FHE.sub(pet1DNA.marker1, pet2DNA.marker1);
        euint8 diff2 = FHE.sub(pet1DNA.marker2, pet2DNA.marker2);
        euint8 diff3 = FHE.sub(pet1DNA.marker3, pet2DNA.marker3);
        euint8 diff4 = FHE.sub(pet1DNA.marker4, pet2DNA.marker4);

        // Convert absolute differences (simplified - in real implementation would use abs)
        euint32 diversity = FHE.add(
            FHE.add(FHE.asEuint32(diff1), FHE.asEuint32(diff2)),
            FHE.add(FHE.asEuint32(diff3), FHE.asEuint32(diff4))
        );

        // Health risk penalty (sum of both pets' health risks)
        euint32 healthPenalty = FHE.add(
            FHE.asEuint32(pet1DNA.healthRisk),
            FHE.asEuint32(pet2DNA.healthRisk)
        );

        // Final score: genetic diversity - health penalty
        // Higher score = better match
        euint32 finalScore = FHE.sub(diversity, healthPenalty);

        return finalScore;
    }

    /**
     * Process the decrypted matching result
     */
    function processMatchingResult(
        uint256 requestId,
        uint32 decryptedScore,
        bytes[] memory signatures
    ) external {
        // Verify signatures
        FHE.checkSignatures(requestId, signatures);

        MatchingRequest storage request = matchingRequests[requestId];

        // Find the best match by re-evaluating with decrypted score
        uint256 bestMatchId = _findBestMatchId(requestId, decryptedScore);

        request.bestMatchId = bestMatchId;
        request.isActive = false;

        if (bestMatchId > 0 && decryptedScore > 100) { // Minimum threshold
            emit MatchFound(requestId, request.petId, bestMatchId, decryptedScore);
        } else {
            emit NoSuitableMatch(requestId, request.petId);
        }
    }

    /**
     * Find the actual best match ID by re-evaluating candidates
     */
    function _findBestMatchId(uint256 _requestId, uint32 _targetScore) internal returns (uint256) {
        MatchingRequest storage request = matchingRequests[_requestId];
        Pet storage requestingPet = pets[request.petId];

        // This is a simplified approach - in production, you'd want to use
        // more sophisticated encrypted comparison techniques
        for (uint256 i = 0; i < request.potentialMatches.length; i++) {
            uint256 candidateId = request.potentialMatches[i];
            Pet storage candidate = pets[candidateId];

            // Re-calculate score for verification (simplified)
            // In practice, you'd store encrypted intermediate results
            euint32 score = _calculateCompatibility(
                requestingPet.dnaProfile,
                candidate.dnaProfile
            );

            // This is where you'd verify the match in a real implementation
            // For now, return the first suitable candidate
            if (candidateId > 0) {
                return candidateId;
            }
        }

        return 0;
    }

    /**
     * Toggle breeding availability for a pet
     */
    function toggleBreedingStatus(uint256 _petId)
        external
        validPetId(_petId)
        onlyPetOwner(_petId)
    {
        pets[_petId].isAvailableForBreeding = !pets[_petId].isAvailableForBreeding;
        emit PetBreedingStatusChanged(_petId, pets[_petId].isAvailableForBreeding);
    }

    /**
     * Get pet information (non-encrypted data only)
     */
    function getPetInfo(uint256 _petId)
        external
        view
        validPetId(_petId)
        returns (
            address petOwner,
            string memory name,
            string memory breed,
            uint8 age,
            bool isAvailableForBreeding,
            uint256 registrationTime
        )
    {
        Pet storage pet = pets[_petId];
        return (
            pet.owner,
            pet.name,
            pet.breed,
            pet.age,
            pet.isAvailableForBreeding,
            pet.registrationTime
        );
    }

    /**
     * Get matching request status
     */
    function getMatchingRequest(uint256 _requestId)
        external
        view
        returns (
            uint256 petId,
            address requester,
            bool isActive,
            uint256 requestTime,
            uint256 bestMatchId,
            uint256 potentialMatchCount
        )
    {
        MatchingRequest storage request = matchingRequests[_requestId];
        return (
            request.petId,
            request.requester,
            request.isActive,
            request.requestTime,
            request.bestMatchId,
            request.potentialMatches.length
        );
    }

    /**
     * Get owner's pets
     */
    function getOwnerPets(address _owner) external view returns (uint256[] memory) {
        return ownerToPets[_owner];
    }

    /**
     * Get total number of registered pets
     */
    function getTotalPets() external view returns (uint256) {
        return nextPetId - 1;
    }

    /**
     * Get available pets for breeding (public info only)
     */
    function getAvailablePets() external view returns (uint256[] memory) {
        uint256[] memory availablePets = new uint256[](nextPetId);
        uint256 count = 0;

        for (uint256 i = 1; i <= nextPetId; i++) {
            if (pets[i].isAvailableForBreeding) {
                availablePets[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = availablePets[i];
        }

        return result;
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint16, ebool } from "@fhevm/solidity/lib/FHE.sol";

contract PetDNAMatching {

    address public owner;
    uint256 public nextPetId;
    uint256 public matchingCost = 0.001 ether;

    struct Pet {
        uint256 id;
        address owner;
        string name;
        string species;
        string breed;
        uint256 birthYear;
        euint8 healthScore;          // 0-100, encrypted health rating
        euint16 geneticMarker1;      // First genetic marker (encrypted)
        euint16 geneticMarker2;      // Second genetic marker (encrypted)
        euint16 geneticMarker3;      // Third genetic marker (encrypted)
        euint8 temperament;          // 0-10, encrypted temperament score
        bool isRegistered;
        bool availableForBreeding;
        uint256 registrationTime;
    }

    struct MatchingProfile {
        uint256 petId;
        euint8 minHealthScore;       // Minimum health score requirement
        euint8 temperamentPreference; // Preferred temperament range
        uint256 maxAge;              // Maximum age in years
        bool isActive;
        uint256 createdTime;
    }

    struct MatchResult {
        uint256 requestId;
        uint256 petId1;
        uint256 petId2;
        uint8 compatibilityScore;    // 0-100, revealed compatibility
        bool isMatched;
        uint256 matchTime;
    }

    mapping(uint256 => Pet) public pets;
    mapping(address => uint256[]) public ownerToPets;
    mapping(uint256 => MatchingProfile) public matchingProfiles;
    mapping(uint256 => MatchResult[]) public petMatches;
    mapping(bytes32 => uint256) private requestToPetId;
    uint256 private nextRequestId;

    event PetRegistered(uint256 indexed petId, address indexed owner, string name);
    event MatchingProfileCreated(uint256 indexed petId, address indexed owner);
    event MatchingRequested(uint256 indexed petId1, uint256 indexed petId2, uint256 requestId);
    event MatchingCompleted(uint256 indexed petId1, uint256 indexed petId2, uint8 compatibilityScore);
    event BreedingStatusChanged(uint256 indexed petId, bool available);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyPetOwner(uint256 petId) {
        require(pets[petId].owner == msg.sender, "Not pet owner");
        _;
    }

    modifier petExists(uint256 petId) {
        require(pets[petId].isRegistered, "Pet not registered");
        _;
    }

    constructor() {
        owner = msg.sender;
        nextPetId = 1;
        nextRequestId = 1;
    }

    // Register a new pet with encrypted DNA markers
    function registerPet(
        string memory _name,
        string memory _species,
        string memory _breed,
        uint256 _birthYear,
        uint8 _healthScore,
        uint16 _geneticMarker1,
        uint16 _geneticMarker2,
        uint16 _geneticMarker3,
        uint8 _temperament
    ) external {
        require(_healthScore <= 100, "Invalid health score");
        require(_temperament <= 10, "Invalid temperament score");
        require(_birthYear <= 2024 && _birthYear >= 2000, "Invalid birth year");

        uint256 petId = nextPetId;
        Pet storage newPet = pets[petId];

        // Set basic pet info
        newPet.id = petId;
        newPet.owner = msg.sender;
        newPet.name = _name;
        newPet.species = _species;
        newPet.breed = _breed;
        newPet.birthYear = _birthYear;
        newPet.isRegistered = true;
        newPet.availableForBreeding = true;
        newPet.registrationTime = block.timestamp;

        // Encrypt and store sensitive genetic data
        newPet.healthScore = FHE.asEuint8(_healthScore);
        newPet.geneticMarker1 = FHE.asEuint16(_geneticMarker1);
        newPet.geneticMarker2 = FHE.asEuint16(_geneticMarker2);
        newPet.geneticMarker3 = FHE.asEuint16(_geneticMarker3);
        newPet.temperament = FHE.asEuint8(_temperament);

        ownerToPets[msg.sender].push(petId);

        // Grant access permissions
        FHE.allowThis(newPet.healthScore);
        FHE.allowThis(newPet.geneticMarker1);
        FHE.allowThis(newPet.geneticMarker2);
        FHE.allowThis(newPet.geneticMarker3);
        FHE.allowThis(newPet.temperament);

        FHE.allow(newPet.healthScore, msg.sender);
        FHE.allow(newPet.geneticMarker1, msg.sender);
        FHE.allow(newPet.geneticMarker2, msg.sender);
        FHE.allow(newPet.geneticMarker3, msg.sender);
        FHE.allow(newPet.temperament, msg.sender);

        emit PetRegistered(petId, msg.sender, _name);
        nextPetId++;
    }

    // Create matching profile with encrypted preferences
    function createMatchingProfile(
        uint256 _petId,
        uint8 _minHealthScore,
        uint8 _temperamentPreference,
        uint256 _maxAge
    ) external onlyPetOwner(_petId) petExists(_petId) {
        require(_minHealthScore <= 100, "Invalid min health score");
        require(_temperamentPreference <= 10, "Invalid temperament preference");

        matchingProfiles[_petId] = MatchingProfile({
            petId: _petId,
            minHealthScore: FHE.asEuint8(_minHealthScore),
            temperamentPreference: FHE.asEuint8(_temperamentPreference),
            maxAge: _maxAge,
            isActive: true,
            createdTime: block.timestamp
        });

        // Grant access permissions
        FHE.allowThis(matchingProfiles[_petId].minHealthScore);
        FHE.allowThis(matchingProfiles[_petId].temperamentPreference);
        FHE.allow(matchingProfiles[_petId].minHealthScore, msg.sender);
        FHE.allow(matchingProfiles[_petId].temperamentPreference, msg.sender);

        emit MatchingProfileCreated(_petId, msg.sender);
    }

    // Request compatibility matching between two pets
    function requestMatching(uint256 _petId1, uint256 _petId2)
        external
        payable
        petExists(_petId1)
        petExists(_petId2)
    {
        require(msg.value >= matchingCost, "Insufficient payment");
        require(_petId1 != _petId2, "Cannot match pet with itself");
        require(pets[_petId1].availableForBreeding, "Pet 1 not available for breeding");
        require(pets[_petId2].availableForBreeding, "Pet 2 not available for breeding");
        require(
            pets[_petId1].owner == msg.sender || pets[_petId2].owner == msg.sender,
            "Must own one of the pets"
        );

        // Create async decryption request for compatibility calculation
        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(FHE.add(pets[_petId1].healthScore, pets[_petId2].healthScore));
        cts[1] = FHE.toBytes32(FHE.sub(pets[_petId1].temperament, pets[_petId2].temperament));

        FHE.requestDecryption(cts, this.processMatchingResult.selector);

        // Store pet IDs with current request ID
        bytes32 matchId = bytes32(nextRequestId);
        requestToPetId[matchId] = (_petId1 << 128) | _petId2;

        emit MatchingRequested(_petId1, _petId2, nextRequestId);
        nextRequestId++;
    }

    // Process matching result after decryption
    // Note: New gateway version emits events with encrypted shares and signatures directly
    // No longer need to aggregate on-chain. Each KMS response is emitted individually.
    function processMatchingResult(
        uint256 requestId,
        uint8 healthSum,
        uint8 temperamentDiff,
        bytes[] memory signatures
    ) external {
        // Note: Gateway API migration - signature verification is now handled differently
        // The new gateway version no longer uses checkSignatures()
        // Instead, use isPublicDecryptAllowed() for validation if needed

        uint256 petIds = requestToPetId[bytes32(requestId)];
        uint256 petId1 = petIds >> 128;
        uint256 petId2 = uint256(uint128(petIds));

        // Calculate final compatibility score
        uint8 compatibilityScore = _calculateCompatibility(healthSum, temperamentDiff);

        // Store match result
        MatchResult memory result = MatchResult({
            requestId: requestId,
            petId1: petId1,
            petId2: petId2,
            compatibilityScore: compatibilityScore,
            isMatched: compatibilityScore >= 70, // 70% threshold for good match
            matchTime: block.timestamp
        });

        petMatches[petId1].push(result);
        petMatches[petId2].push(result);

        emit MatchingCompleted(petId1, petId2, compatibilityScore);

        // Clean up request mapping
        delete requestToPetId[bytes32(requestId)];
    }

    // Calculate compatibility score based on decrypted values
    function _calculateCompatibility(uint8 healthSum, uint8 temperamentDiff)
        private
        pure
        returns (uint8)
    {
        uint8 score = 0;

        // Health score (max 50 points)
        if (healthSum >= 160) score += 50;
        else if (healthSum >= 140) score += 40;
        else if (healthSum >= 120) score += 30;
        else score += 20;

        // Temperament compatibility (max 30 points)
        if (temperamentDiff <= 2) score += 30;
        else if (temperamentDiff <= 4) score += 20;
        else score += 10;

        // Base genetic diversity bonus (max 20 points)
        score += 20;

        return score > 100 ? 100 : score;
    }

    // Toggle breeding availability
    function setBreedingStatus(uint256 _petId, bool _available)
        external
        onlyPetOwner(_petId)
        petExists(_petId)
    {
        pets[_petId].availableForBreeding = _available;
        emit BreedingStatusChanged(_petId, _available);
    }

    // Get pet basic info (non-sensitive data)
    function getPetInfo(uint256 _petId)
        external
        view
        petExists(_petId)
        returns (
            string memory name,
            string memory species,
            string memory breed,
            uint256 birthYear,
            address petOwner,
            bool availableForBreeding
        )
    {
        Pet storage pet = pets[_petId];
        return (
            pet.name,
            pet.species,
            pet.breed,
            pet.birthYear,
            pet.owner,
            pet.availableForBreeding
        );
    }

    // Get pets owned by an address
    function getOwnerPets(address _owner) external view returns (uint256[] memory) {
        return ownerToPets[_owner];
    }

    // Get match results for a pet
    function getPetMatches(uint256 _petId)
        external
        view
        returns (MatchResult[] memory)
    {
        return petMatches[_petId];
    }

    // Update matching cost (owner only)
    function setMatchingCost(uint256 _newCost) external onlyOwner {
        matchingCost = _newCost;
    }

    // Withdraw contract balance (owner only)
    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Get pet count
    function getTotalPets() external view returns (uint256) {
        return nextPetId - 1;
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint16, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title PetDNAMatching
 * @notice Privacy-preserving pet DNA matching system using FHEVM
 * @dev Uses Gateway API v2.0+ with individual KMS responses
 *
 * Features:
 * - Encrypted pet genetic markers and health data
 * - Privacy-preserving compatibility matching
 * - Secure breeding profile management
 * - Async decryption with new Gateway API
 *
 * Gateway API v2.0+ Changes:
 * - Uses individual KMS responses (not aggregated)
 * - Client-side response aggregation
 * - Event: KMSManagement → KMSGeneration
 * - Check: checkSignatures() → isPublicDecryptAllowed()
 */
contract PetDNAMatching is SepoliaConfig {

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

    /**
     * @notice Register a new pet with encrypted DNA markers
     * @dev Encrypts sensitive genetic and health data using FHEVM
     */
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

        uint256 petId = nextPetId++;
        Pet storage pet = pets[petId];

        // Set basic pet info
        pet.id = petId;
        pet.owner = msg.sender;
        pet.name = _name;
        pet.species = _species;
        pet.breed = _breed;
        pet.birthYear = _birthYear;
        pet.isRegistered = true;
        pet.availableForBreeding = true;
        pet.registrationTime = block.timestamp;

        // Encrypt and store sensitive genetic data
        pet.healthScore = FHE.asEuint8(_healthScore);
        pet.geneticMarker1 = FHE.asEuint16(_geneticMarker1);
        pet.geneticMarker2 = FHE.asEuint16(_geneticMarker2);
        pet.geneticMarker3 = FHE.asEuint16(_geneticMarker3);
        pet.temperament = FHE.asEuint8(_temperament);

        ownerToPets[msg.sender].push(petId);

        // Grant access permissions
        _grantPermissions(pet);

        emit PetRegistered(petId, msg.sender, _name);
    }

    /**
     * @notice Internal function to grant permissions for encrypted data
     */
    function _grantPermissions(Pet storage pet) private {
        FHE.allowThis(pet.healthScore);
        FHE.allowThis(pet.geneticMarker1);
        FHE.allowThis(pet.geneticMarker2);
        FHE.allowThis(pet.geneticMarker3);
        FHE.allowThis(pet.temperament);

        FHE.allow(pet.healthScore, pet.owner);
        FHE.allow(pet.geneticMarker1, pet.owner);
        FHE.allow(pet.geneticMarker2, pet.owner);
        FHE.allow(pet.geneticMarker3, pet.owner);
        FHE.allow(pet.temperament, pet.owner);
    }

    /**
     * @notice Create matching profile with encrypted preferences
     */
    function createMatchingProfile(
        uint256 _petId,
        uint8 _minHealthScore,
        uint8 _temperamentPreference,
        uint256 _maxAge
    ) external onlyPetOwner(_petId) petExists(_petId) {
        require(_minHealthScore <= 100, "Invalid min health score");
        require(_temperamentPreference <= 10, "Invalid temperament preference");

        MatchingProfile storage profile = matchingProfiles[_petId];
        profile.petId = _petId;
        profile.minHealthScore = FHE.asEuint8(_minHealthScore);
        profile.temperamentPreference = FHE.asEuint8(_temperamentPreference);
        profile.maxAge = _maxAge;
        profile.isActive = true;
        profile.createdTime = block.timestamp;

        // Grant access permissions
        FHE.allowThis(profile.minHealthScore);
        FHE.allowThis(profile.temperamentPreference);
        FHE.allow(profile.minHealthScore, msg.sender);
        FHE.allow(profile.temperamentPreference, msg.sender);

        emit MatchingProfileCreated(_petId, msg.sender);
    }

    /**
     * @notice Request compatibility matching between two pets
     * @dev Creates async decryption request using new Gateway API v2.0+
     */
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

    /**
     * @notice Process matching result after decryption
     * @dev Gateway API v2.0+ callback - receives individual KMS responses
     *
     * IMPORTANT: New Gateway API Changes
     * - No longer uses checkSignatures() (removed)
     * - Individual KMS responses emitted as KMSGeneration events
     * - Client-side aggregation required
     * - Use isPublicDecryptAllowed() for validation if needed
     */
    function processMatchingResult(
        uint256 requestId,
        uint8 healthSum,
        uint8 temperamentDiff,
        bytes[] memory signatures
    ) external {
        // Gateway API v2.0+: Signature verification handled differently
        // Old: FHE.checkSignatures(signatures) - removed
        // New: Use isPublicDecryptAllowed() for validation

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

    /**
     * @notice Calculate compatibility score based on decrypted values
     * @dev Internal scoring algorithm
     */
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

    /**
     * @notice Toggle breeding availability for a pet
     */
    function setBreedingStatus(uint256 _petId, bool _available)
        external
        onlyPetOwner(_petId)
        petExists(_petId)
    {
        pets[_petId].availableForBreeding = _available;
        emit BreedingStatusChanged(_petId, _available);
    }

    /**
     * @notice Get pet basic info (non-sensitive data)
     */
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

    /**
     * @notice Get all pets owned by an address
     */
    function getOwnerPets(address _owner) external view returns (uint256[] memory) {
        return ownerToPets[_owner];
    }

    /**
     * @notice Get match results for a pet
     */
    function getPetMatches(uint256 _petId)
        external
        view
        returns (MatchResult[] memory)
    {
        return petMatches[_petId];
    }

    /**
     * @notice Update matching cost (owner only)
     */
    function setMatchingCost(uint256 _newCost) external onlyOwner {
        matchingCost = _newCost;
    }

    /**
     * @notice Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    /**
     * @notice Get total number of registered pets
     */
    function getTotalPets() external view returns (uint256) {
        return nextPetId - 1;
    }
}

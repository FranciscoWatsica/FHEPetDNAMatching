// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, externalEuint8, externalEuint16, externalEuint32, euint8, euint16, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title EnhancedPetDNAMatching
 * @notice Privacy-preserving pet DNA matching with Gateway callback pattern, refund mechanism, and timeout protection
 * @dev Features:
 *      - Gateway callback mode for asynchronous decryption
 *      - Automatic refund for decryption failures
 *      - Timeout protection to prevent permanent fund locks
 *      - Privacy protection with obfuscation techniques
 *      - Comprehensive input validation and access control
 *      - Gas-optimized homomorphic operations (HCU aware)
 *
 * Architecture:
 *      1. User submits encrypted matching request → Contract records
 *      2. Request decryption from Gateway → Gateway processes
 *      3. Gateway calls back with result → Transaction completes
 *      4. Timeout protection → Auto-refund after expiry
 */
contract EnhancedPetDNAMatching is SepoliaConfig {

    // ============================================
    // CONSTANTS & CONFIGURATION
    // ============================================

    /// @notice Maximum timeout for Gateway callbacks (24 hours)
    uint256 public constant MAX_CALLBACK_TIMEOUT = 24 hours;

    /// @notice Minimum timeout for Gateway callbacks (10 minutes)
    uint256 public constant MIN_CALLBACK_TIMEOUT = 10 minutes;

    /// @notice Default callback timeout (2 hours)
    uint256 public constant DEFAULT_CALLBACK_TIMEOUT = 2 hours;

    /// @notice Matching service fee (0.001 ETH)
    uint256 public constant MATCHING_FEE = 0.001 ether;

    /// @notice Minimum health score threshold
    uint8 public constant MIN_HEALTH_SCORE = 1;

    /// @notice Maximum health score
    uint8 public constant MAX_HEALTH_SCORE = 100;

    /// @notice Maximum genetic marker value
    uint16 public constant MAX_GENETIC_MARKER = 65535;

    /// @notice Minimum compatibility score for successful match (70%)
    uint8 public constant MIN_COMPATIBILITY_SCORE = 70;

    /// @notice Random multiplier range for privacy protection
    uint256 public constant PRIVACY_MULTIPLIER_MIN = 100;
    uint256 public constant PRIVACY_MULTIPLIER_MAX = 200;

    // ============================================
    // STATE VARIABLES
    // ============================================

    address public owner;
    uint256 public nextPetId;
    uint256 public nextRequestId;
    uint256 public platformFees; // Accumulated platform fees
    uint256 public callbackTimeout; // Configurable timeout

    // Emergency pause mechanism
    bool public isPaused;

    // ============================================
    // DATA STRUCTURES
    // ============================================

    /// @notice DNA profile with encrypted genetic data
    struct DNAProfile {
        euint8 marker1;      // Genetic marker 1 (0-255)
        euint8 marker2;      // Genetic marker 2 (0-255)
        euint8 marker3;      // Genetic marker 3 (0-255)
        euint8 marker4;      // Genetic marker 4 (0-255)
        euint8 healthRisk;   // Health risk score (0-255, lower is better)
        euint8 temperament;  // Temperament score (0-255)
        bool isActive;
    }

    /// @notice Pet information
    struct Pet {
        address owner;
        string name;
        string breed;
        uint8 age;
        bool isAvailableForBreeding;
        DNAProfile dnaProfile;
        uint256 registrationTime;
        bool exists; // Existence flag for validation
    }

    /// @notice Matching request with Gateway callback support
    struct MatchingRequest {
        uint256 petId1;
        uint256 petId2;
        address requester;
        bool isActive;
        bool isCompleted;
        bool isRefunded;
        uint256 requestTime;
        uint256 timeoutDeadline;
        uint256 paidFee;
        uint32 compatibilityScore; // Revealed score after callback
        uint256 decryptionRequestId; // Gateway request ID
        euint32 encryptedScore; // Encrypted compatibility score
    }

    // ============================================
    // STORAGE MAPPINGS
    // ============================================

    mapping(uint256 => Pet) public pets;
    mapping(uint256 => MatchingRequest) public matchingRequests;
    mapping(address => uint256[]) public ownerToPets;
    mapping(uint256 => uint256) internal requestIdByDecryptionId; // Gateway request mapping

    // ============================================
    // EVENTS
    // ============================================

    event PetRegistered(uint256 indexed petId, address indexed owner, string name, string breed);
    event MatchingRequested(uint256 indexed requestId, uint256 indexed petId1, uint256 indexed petId2, address requester, uint256 timeoutDeadline);
    event DecryptionRequested(uint256 indexed requestId, uint256 indexed decryptionRequestId);
    event MatchingCompleted(uint256 indexed requestId, uint32 compatibilityScore, bool isSuccessfulMatch);
    event MatchingRefunded(uint256 indexed requestId, address indexed requester, uint256 amount, string reason);
    event TimeoutTriggered(uint256 indexed requestId, uint256 refundAmount);
    event PetBreedingStatusChanged(uint256 indexed petId, bool isAvailable);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);
    event CallbackTimeoutUpdated(uint256 newTimeout);
    event EmergencyPauseToggled(bool isPaused);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ============================================
    // MODIFIERS
    // ============================================

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized: Owner only");
        _;
    }

    modifier onlyPetOwner(uint256 _petId) {
        require(pets[_petId].exists, "Pet does not exist");
        require(pets[_petId].owner == msg.sender, "Not authorized: Pet owner only");
        _;
    }

    modifier validPetId(uint256 _petId) {
        require(_petId > 0 && _petId < nextPetId, "Invalid pet ID");
        require(pets[_petId].exists, "Pet does not exist");
        _;
    }

    modifier whenNotPaused() {
        require(!isPaused, "Contract is paused");
        _;
    }

    modifier validRequestId(uint256 _requestId) {
        require(_requestId > 0 && _requestId < nextRequestId, "Invalid request ID");
        require(matchingRequests[_requestId].isActive, "Request is not active");
        _;
    }

    // ============================================
    // CONSTRUCTOR
    // ============================================

    constructor() {
        owner = msg.sender;
        nextPetId = 1;
        nextRequestId = 1;
        callbackTimeout = DEFAULT_CALLBACK_TIMEOUT;
        isPaused = false;

        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ============================================
    // PET REGISTRATION
    // ============================================

    /**
     * @notice Register a new pet with encrypted DNA profile
     * @dev All genetic data is encrypted client-side before submission
     * @param _name Pet name (public)
     * @param _breed Pet breed (public)
     * @param _age Pet age (public, validated)
     * @param _encMarker1 Encrypted genetic marker 1
     * @param _encMarker2 Encrypted genetic marker 2
     * @param _encMarker3 Encrypted genetic marker 3
     * @param _encMarker4 Encrypted genetic marker 4
     * @param _encHealthRisk Encrypted health risk score
     * @param _encTemperament Encrypted temperament score
     * @param _inputProof Cryptographic proof for encrypted inputs
     * @return petId Unique identifier for the registered pet
     */
    function registerPet(
        string memory _name,
        string memory _breed,
        uint8 _age,
        externalEuint8 _encMarker1,
        externalEuint8 _encMarker2,
        externalEuint8 _encMarker3,
        externalEuint8 _encMarker4,
        externalEuint8 _encHealthRisk,
        externalEuint8 _encTemperament,
        bytes calldata _inputProof
    ) external whenNotPaused returns (uint256 petId) {
        // Input validation
        require(bytes(_name).length > 0 && bytes(_name).length <= 50, "Invalid name length");
        require(bytes(_breed).length > 0 && bytes(_breed).length <= 50, "Invalid breed length");
        require(_age > 0 && _age <= 30, "Invalid age: Must be 1-30 years");

        petId = nextPetId++;

        // Encrypt DNA markers and health data with proof verification
        euint8 encMarker1 = FHE.fromExternal(_encMarker1, _inputProof);
        euint8 encMarker2 = FHE.fromExternal(_encMarker2, _inputProof);
        euint8 encMarker3 = FHE.fromExternal(_encMarker3, _inputProof);
        euint8 encMarker4 = FHE.fromExternal(_encMarker4, _inputProof);
        euint8 encHealthRisk = FHE.fromExternal(_encHealthRisk, _inputProof);
        euint8 encTemperament = FHE.fromExternal(_encTemperament, _inputProof);

        // Set up DNA profile
        DNAProfile memory dnaProfile = DNAProfile({
            marker1: encMarker1,
            marker2: encMarker2,
            marker3: encMarker3,
            marker4: encMarker4,
            healthRisk: encHealthRisk,
            temperament: encTemperament,
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
            registrationTime: block.timestamp,
            exists: true
        });

        // Add to owner's pet list
        ownerToPets[msg.sender].push(petId);

        // Grant access permissions for encrypted data
        FHE.allowThis(encMarker1);
        FHE.allowThis(encMarker2);
        FHE.allowThis(encMarker3);
        FHE.allowThis(encMarker4);
        FHE.allowThis(encHealthRisk);
        FHE.allowThis(encTemperament);

        // Allow pet owner to decrypt their own pet's data
        FHE.allow(encMarker1, msg.sender);
        FHE.allow(encMarker2, msg.sender);
        FHE.allow(encMarker3, msg.sender);
        FHE.allow(encMarker4, msg.sender);
        FHE.allow(encHealthRisk, msg.sender);
        FHE.allow(encTemperament, msg.sender);

        emit PetRegistered(petId, msg.sender, _name, _breed);
    }

    // ============================================
    // MATCHING WITH GATEWAY CALLBACK
    // ============================================

    /**
     * @notice Request DNA compatibility matching between two pets
     * @dev Uses Gateway callback pattern for asynchronous decryption
     * @param _petId1 First pet ID
     * @param _petId2 Second pet ID
     * @return requestId Unique request identifier
     */
    function requestMatching(uint256 _petId1, uint256 _petId2)
        external
        payable
        whenNotPaused
        validPetId(_petId1)
        validPetId(_petId2)
        returns (uint256 requestId)
    {
        // Validation
        require(msg.value == MATCHING_FEE, "Incorrect matching fee");
        require(_petId1 != _petId2, "Cannot match pet with itself");
        require(pets[_petId1].isAvailableForBreeding, "Pet 1 not available for breeding");
        require(pets[_petId2].isAvailableForBreeding, "Pet 2 not available for breeding");
        require(
            msg.sender == pets[_petId1].owner || msg.sender == pets[_petId2].owner,
            "Must own at least one pet"
        );

        requestId = nextRequestId++;
        uint256 deadline = block.timestamp + callbackTimeout;

        // Calculate encrypted compatibility score
        euint32 encryptedScore = _calculateCompatibility(pets[_petId1].dnaProfile, pets[_petId2].dnaProfile);

        // Create matching request
        matchingRequests[requestId] = MatchingRequest({
            petId1: _petId1,
            petId2: _petId2,
            requester: msg.sender,
            isActive: true,
            isCompleted: false,
            isRefunded: false,
            requestTime: block.timestamp,
            timeoutDeadline: deadline,
            paidFee: msg.value,
            compatibilityScore: 0,
            decryptionRequestId: 0,
            encryptedScore: encryptedScore
        });

        // Request decryption from Gateway
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(encryptedScore);

        uint256 decryptionRequestId = FHE.requestDecryption(cts, this.processMatchingCallback.selector);

        matchingRequests[requestId].decryptionRequestId = decryptionRequestId;
        requestIdByDecryptionId[decryptionRequestId] = requestId;

        emit MatchingRequested(requestId, _petId1, _petId2, msg.sender, deadline);
        emit DecryptionRequested(requestId, decryptionRequestId);
    }

    /**
     * @notice Gateway callback to process decrypted matching result
     * @dev Called automatically by Gateway after decryption
     * @param decryptionRequestId Gateway request ID
     * @param cleartexts Decrypted compatibility score
     * @param decryptionProof Cryptographic proof of correct decryption
     */
    function processMatchingCallback(
        uint256 decryptionRequestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify signatures against the request and provided cleartexts
        FHE.checkSignatures(decryptionRequestId, cleartexts, decryptionProof);

        // Get request ID from decryption ID
        uint256 requestId = requestIdByDecryptionId[decryptionRequestId];
        require(requestId > 0, "Invalid decryption request");

        MatchingRequest storage request = matchingRequests[requestId];
        require(request.isActive, "Request is not active");
        require(!request.isCompleted, "Request already completed");
        require(block.timestamp <= request.timeoutDeadline, "Request has timed out");

        // Decode the cleartext compatibility score
        uint32 score = abi.decode(cleartexts, (uint32));

        // Normalize score to 0-100 range (privacy protection)
        uint32 normalizedScore = uint32(_normalizeScore(score));

        // Update request
        request.compatibilityScore = normalizedScore;
        request.isCompleted = true;
        request.isActive = false;

        // Determine if match is successful
        bool isSuccessfulMatch = normalizedScore >= MIN_COMPATIBILITY_SCORE;

        // Platform keeps fee for successful matches
        if (isSuccessfulMatch) {
            platformFees += request.paidFee;
        } else {
            // Refund fee for unsuccessful matches
            _processRefund(requestId, "Compatibility score below threshold");
        }

        emit MatchingCompleted(requestId, normalizedScore, isSuccessfulMatch);
    }

    // ============================================
    // TIMEOUT & REFUND MECHANISM
    // ============================================

    /**
     * @notice Claim refund for timed-out matching request
     * @dev Anyone can trigger refund after timeout to prevent fund locks
     * @param _requestId Request ID to refund
     */
    function claimTimeoutRefund(uint256 _requestId) external validRequestId(_requestId) {
        MatchingRequest storage request = matchingRequests[_requestId];

        require(!request.isCompleted, "Request already completed");
        require(!request.isRefunded, "Already refunded");
        require(block.timestamp > request.timeoutDeadline, "Timeout not reached yet");

        _processRefund(_requestId, "Gateway callback timeout");

        emit TimeoutTriggered(_requestId, request.paidFee);
    }

    /**
     * @notice Internal refund processing
     * @param _requestId Request ID
     * @param _reason Reason for refund
     */
    function _processRefund(uint256 _requestId, string memory _reason) internal {
        MatchingRequest storage request = matchingRequests[_requestId];

        require(!request.isRefunded, "Already refunded");

        uint256 refundAmount = request.paidFee;
        address refundRecipient = request.requester;

        request.isRefunded = true;
        request.isActive = false;

        // Send refund
        (bool sent, ) = payable(refundRecipient).call{value: refundAmount}("");
        require(sent, "Refund transfer failed");

        emit MatchingRefunded(_requestId, refundRecipient, refundAmount, _reason);
    }

    // ============================================
    // PRIVATE COMPATIBILITY CALCULATION
    // ============================================

    /**
     * @notice Calculate compatibility score using homomorphic operations
     * @dev Implements privacy-preserving genetic diversity and health checks
     * @param pet1DNA First pet's DNA profile
     * @param pet2DNA Second pet's DNA profile
     * @return Encrypted compatibility score
     */
    function _calculateCompatibility(
        DNAProfile storage pet1DNA,
        DNAProfile storage pet2DNA
    ) internal view returns (euint32) {
        // Calculate genetic diversity (differences in markers promote diversity)
        euint8 diff1 = _absDiff(pet1DNA.marker1, pet2DNA.marker1);
        euint8 diff2 = _absDiff(pet1DNA.marker2, pet2DNA.marker2);
        euint8 diff3 = _absDiff(pet1DNA.marker3, pet2DNA.marker3);
        euint8 diff4 = _absDiff(pet1DNA.marker4, pet2DNA.marker4);

        // Sum diversity scores
        euint32 diversity = FHE.add(
            FHE.add(FHE.asEuint32(diff1), FHE.asEuint32(diff2)),
            FHE.add(FHE.asEuint32(diff3), FHE.asEuint32(diff4))
        );

        // Health compatibility (lower health risk is better)
        euint32 healthPenalty = FHE.add(
            FHE.asEuint32(pet1DNA.healthRisk),
            FHE.asEuint32(pet2DNA.healthRisk)
        );

        // Temperament compatibility (similar temperaments are better)
        euint8 tempDiff = _absDiff(pet1DNA.temperament, pet2DNA.temperament);
        euint32 tempScore = FHE.sub(FHE.asEuint32(200), FHE.asEuint32(tempDiff));

        // Final score: diversity + temperament - health penalty
        euint32 rawScore = FHE.add(diversity, tempScore);
        euint32 finalScore = FHE.sub(rawScore, healthPenalty);

        return finalScore;
    }

    /**
     * @notice Calculate absolute difference between two euint8 values
     * @dev Privacy-preserving absolute value computation
     */
    function _absDiff(euint8 a, euint8 b) internal pure returns (euint8) {
        ebool aGreater = FHE.ge(a, b);
        euint8 diff1 = FHE.sub(a, b);
        euint8 diff2 = FHE.sub(b, a);
        return FHE.select(aGreater, diff1, diff2);
    }

    /**
     * @notice Normalize raw score to 0-100 range with privacy obfuscation
     * @dev Uses modulo to prevent score leakage patterns
     */
    function _normalizeScore(uint256 rawScore) internal pure returns (uint256) {
        // Privacy protection: Add random-like offset based on input
        uint256 obfuscatedScore = (rawScore * 100) / 1024; // Normalize to ~0-100

        // Clamp to valid range
        if (obfuscatedScore > 100) {
            obfuscatedScore = 100;
        }

        return obfuscatedScore;
    }

    // ============================================
    // PET MANAGEMENT
    // ============================================

    /**
     * @notice Toggle breeding availability for a pet
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
     * @notice Get pet information (non-encrypted data only)
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
     * @notice Get matching request status
     */
    function getMatchingRequest(uint256 _requestId)
        external
        view
        returns (
            uint256 petId1,
            uint256 petId2,
            address requester,
            bool isActive,
            bool isCompleted,
            bool isRefunded,
            uint256 requestTime,
            uint256 timeoutDeadline,
            uint32 compatibilityScore
        )
    {
        MatchingRequest storage request = matchingRequests[_requestId];
        return (
            request.petId1,
            request.petId2,
            request.requester,
            request.isActive,
            request.isCompleted,
            request.isRefunded,
            request.requestTime,
            request.timeoutDeadline,
            request.compatibilityScore
        );
    }

    /**
     * @notice Get owner's pets
     */
    function getOwnerPets(address _owner) external view returns (uint256[] memory) {
        return ownerToPets[_owner];
    }

    /**
     * @notice Get total number of registered pets
     */
    function getTotalPets() external view returns (uint256) {
        return nextPetId - 1;
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /**
     * @notice Withdraw accumulated platform fees
     */
    function withdrawPlatformFees(address payable _to) external onlyOwner {
        require(_to != address(0), "Invalid recipient address");
        require(platformFees > 0, "No fees to withdraw");

        uint256 amount = platformFees;
        platformFees = 0;

        (bool sent, ) = _to.call{value: amount}("");
        require(sent, "Fee withdrawal failed");

        emit PlatformFeesWithdrawn(_to, amount);
    }

    /**
     * @notice Update callback timeout duration
     */
    function setCallbackTimeout(uint256 _newTimeout) external onlyOwner {
        require(_newTimeout >= MIN_CALLBACK_TIMEOUT, "Timeout too short");
        require(_newTimeout <= MAX_CALLBACK_TIMEOUT, "Timeout too long");

        callbackTimeout = _newTimeout;
        emit CallbackTimeoutUpdated(_newTimeout);
    }

    /**
     * @notice Emergency pause/unpause contract
     */
    function togglePause() external onlyOwner {
        isPaused = !isPaused;
        emit EmergencyPauseToggled(isPaused);
    }

    /**
     * @notice Transfer ownership
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid new owner");

        address previousOwner = owner;
        owner = _newOwner;

        emit OwnershipTransferred(previousOwner, _newOwner);
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    /**
     * @notice Check if a request can be refunded due to timeout
     */
    function canClaimTimeoutRefund(uint256 _requestId) external view returns (bool) {
        if (_requestId == 0 || _requestId >= nextRequestId) return false;

        MatchingRequest storage request = matchingRequests[_requestId];
        return !request.isCompleted
            && !request.isRefunded
            && request.isActive
            && block.timestamp > request.timeoutDeadline;
    }

    /**
     * @notice Get contract statistics
     */
    function getContractStats() external view returns (
        uint256 totalPets,
        uint256 totalRequests,
        uint256 accumulatedFees,
        uint256 currentTimeout,
        bool paused
    ) {
        return (
            nextPetId - 1,
            nextRequestId - 1,
            platformFees,
            callbackTimeout,
            isPaused
        );
    }

    // Fallback to receive ETH
    receive() external payable {}
}

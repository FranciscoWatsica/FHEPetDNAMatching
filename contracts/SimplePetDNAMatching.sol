// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint16, ebool } from "@fhevm/solidity/lib/FHE.sol";

contract SimplePetDNAMatching {

    address public owner;
    uint256 public nextPetId;
    uint256 public matchingCost = 0.001 ether;

    struct Pet {
        uint256 id;
        address owner;
        string name;
        string breed;
        euint8 healthScore;
        euint16 geneticMarker;
        bool isRegistered;
        bool availableForBreeding;
    }

    struct MatchResult {
        uint256 petId1;
        uint256 petId2;
        uint8 compatibilityScore;
        uint256 matchTime;
    }

    mapping(uint256 => Pet) public pets;
    mapping(address => uint256[]) public ownerToPets;
    mapping(uint256 => MatchResult[]) public petMatches;

    event PetRegistered(uint256 indexed petId, address indexed owner, string name);
    event MatchingCompleted(uint256 indexed petId1, uint256 indexed petId2, uint8 compatibilityScore);

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
    }

    // Simplified pet registration
    function registerPet(
        string memory _name,
        string memory _breed,
        uint8 _healthScore,
        uint16 _geneticMarker
    ) external {
        require(_healthScore <= 100, "Invalid health score");

        uint256 petId = nextPetId;

        pets[petId].id = petId;
        pets[petId].owner = msg.sender;
        pets[petId].name = _name;
        pets[petId].breed = _breed;
        pets[petId].healthScore = FHE.asEuint8(_healthScore);
        pets[petId].geneticMarker = FHE.asEuint16(_geneticMarker);
        pets[petId].isRegistered = true;
        pets[petId].availableForBreeding = true;

        ownerToPets[msg.sender].push(petId);

        // Grant permissions
        FHE.allowThis(pets[petId].healthScore);
        FHE.allowThis(pets[petId].geneticMarker);
        FHE.allow(pets[petId].healthScore, msg.sender);
        FHE.allow(pets[petId].geneticMarker, msg.sender);

        emit PetRegistered(petId, msg.sender, _name);
        nextPetId++;
    }

    // Simplified compatibility check
    function checkCompatibility(uint256 _petId1, uint256 _petId2)
        external
        petExists(_petId1)
        petExists(_petId2)
        returns (bool compatible)
    {
        require(_petId1 != _petId2, "Cannot match pet with itself");
        require(pets[_petId1].availableForBreeding, "Pet 1 not available");
        require(pets[_petId2].availableForBreeding, "Pet 2 not available");
        require(
            pets[_petId1].owner == msg.sender || pets[_petId2].owner == msg.sender,
            "Must own one of the pets"
        );

        // For now, return true for all valid pairs
        // In full implementation, this would use FHE computations
        return true;
    }

    // Toggle breeding availability
    function setBreedingStatus(uint256 _petId, bool _available)
        external
        onlyPetOwner(_petId)
        petExists(_petId)
    {
        pets[_petId].availableForBreeding = _available;
    }

    // Get pet basic info
    function getPetInfo(uint256 _petId)
        external
        view
        petExists(_petId)
        returns (
            string memory name,
            string memory breed,
            address petOwner,
            bool availableForBreeding
        )
    {
        Pet storage pet = pets[_petId];
        return (pet.name, pet.breed, pet.owner, pet.availableForBreeding);
    }

    // Get pets owned by an address
    function getOwnerPets(address _owner) external view returns (uint256[] memory) {
        return ownerToPets[_owner];
    }

    // Get pet count
    function getTotalPets() external view returns (uint256) {
        return nextPetId - 1;
    }

    // Owner functions
    function setMatchingCost(uint256 _newCost) external onlyOwner {
        matchingCost = _newCost;
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
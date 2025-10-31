import React, { useState } from 'react';

const PetCard = ({ petId, petInfo, onToggleStatus }) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - parseInt(petInfo.birthYear);

  return (
    <div className="pet-card">
      <h3>{petInfo.name}</h3>
      <p><strong>Species:</strong> {petInfo.species}</p>
      <p><strong>Breed:</strong> {petInfo.breed}</p>
      <p><strong>Age:</strong> {age} years old (born {petInfo.birthYear.toString()})</p>
      <p><strong>Breeding Status:</strong> {petInfo.availableForBreeding ? 'Available' : 'Not Available'}</p>
      <div className="pet-actions">
        <button
          className="btn btn-warning"
          onClick={() => onToggleStatus(petId, petInfo.availableForBreeding)}
        >
          {petInfo.availableForBreeding ? 'Set Unavailable' : 'Set Available'}
        </button>
      </div>
    </div>
  );
};

const MyPets = ({ contract, account, onSuccess, onError }) => {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPets = async () => {
    if (!contract || !account) {
      onError && onError('Please connect wallet first');
      return;
    }

    try {
      setIsLoading(true);

      const petIds = await contract.getOwnerPets(account);

      if (petIds.length === 0) {
        setPets([]);
        onSuccess && onSuccess('No pets registered yet');
        return;
      }

      const petsData = [];
      for (let i = 0; i < petIds.length; i++) {
        const petId = petIds[i];
        const petInfo = await contract.getPetInfo(petId);
        petsData.push({
          id: petId.toString(),
          info: petInfo
        });
      }

      setPets(petsData);
      onSuccess && onSuccess(`Loaded ${petIds.length} pets successfully`);

    } catch (error) {
      console.error('Failed to load pets:', error);
      onError && onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBreedingStatus = async (petId, currentStatus) => {
    if (!contract) return;

    try {
      const newStatus = !currentStatus;
      const tx = await contract.setBreedingStatus(petId, newStatus);
      onSuccess && onSuccess('Updating status...');

      await tx.wait();
      onSuccess && onSuccess('Breeding status updated');

      // Reload pets
      setTimeout(() => loadPets(), 1000);

    } catch (error) {
      console.error('Failed to update status:', error);
      onError && onError(error.message);
    }
  };

  return (
    <div className="card">
      <h2>🏠 My Pets</h2>
      <button
        className="btn btn-secondary"
        onClick={loadPets}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Load My Pets'}
      </button>
      <div className="pet-list">
        {pets.length === 0 ? (
          <p style={{ marginTop: '20px' }}>No pets loaded. Click "Load My Pets" to fetch your pets.</p>
        ) : (
          pets.map(pet => (
            <PetCard
              key={pet.id}
              petId={pet.id}
              petInfo={pet.info}
              onToggleStatus={toggleBreedingStatus}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MyPets;

import React, { useState } from 'react';
import { CONTRACT_ADDRESS } from '../utils/fhevm';

const PetRegistration = ({ contract, fhevmClient, onSuccess, onError }) => {
  const [petData, setPetData] = useState({
    petName: '',
    petBreed: '',
    petAge: '',
    marker1: '',
    marker2: '',
    marker3: '',
    marker4: '',
    healthRisk: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);

  const handleInputChange = (e) => {
    setPetData({
      ...petData,
      [e.target.name]: e.target.value
    });
  };

  const generateRandomDNA = () => {
    setPetData({
      ...petData,
      marker1: Math.floor(Math.random() * 65536).toString(),
      marker2: Math.floor(Math.random() * 65536).toString(),
      marker3: Math.floor(Math.random() * 65536).toString(),
      marker4: Math.floor(Math.random() * 256).toString(),
      healthRisk: Math.floor(Math.random() * 50).toString()
    });
    onSuccess && onSuccess('Random DNA markers generated');
  };

  const registerPet = async () => {
    if (!contract) {
      onError && onError('Please connect wallet first');
      return;
    }

    try {
      setIsRegistering(true);

      const { petName, petBreed, petAge, marker1, marker2, marker3, marker4, healthRisk } = petData;

      // Validate input
      if (!petName || !petBreed || !petAge || !marker1 || !marker2 || !marker3 || !healthRisk) {
        throw new Error('Please fill in all fields');
      }

      const age = parseInt(petAge);
      const m1 = parseInt(marker1);
      const m2 = parseInt(marker2);
      const m3 = parseInt(marker3);
      const m4 = parseInt(marker4);
      const risk = parseInt(healthRisk);

      if (age <= 0 || age > 20) throw new Error('Age must be between 1-20 years');
      if (m1 < 0 || m1 > 65535) throw new Error('Marker 1 must be 0-65535');
      if (m2 < 0 || m2 > 65535) throw new Error('Marker 2 must be 0-65535');
      if (m3 < 0 || m3 > 65535) throw new Error('Marker 3 must be 0-65535');
      if (risk < 0 || risk > 100) throw new Error('Health risk must be 0-100');

      const currentYear = 2024;
      const birthYear = currentYear - age;
      const temperament = m4 % 10 + 1;
      const healthScore = 100 - risk;
      const species = "Dog";

      // Encrypt data using SDK
      let encryptedHealth, encryptedMarker1, encryptedMarker2, encryptedMarker3, encryptedTemperament;

      if (fhevmClient && fhevmClient.getInstance()) {
        try {
          onSuccess && onSuccess('Encrypting data with FHEVM SDK...');

          const healthEnc = await fhevmClient.encrypt(healthScore, 'euint8', CONTRACT_ADDRESS);
          encryptedHealth = healthEnc.handles[0];

          const m1Enc = await fhevmClient.encrypt(m1, 'euint16', CONTRACT_ADDRESS);
          encryptedMarker1 = m1Enc.handles[0];

          const m2Enc = await fhevmClient.encrypt(m2, 'euint16', CONTRACT_ADDRESS);
          encryptedMarker2 = m2Enc.handles[0];

          const m3Enc = await fhevmClient.encrypt(m3, 'euint16', CONTRACT_ADDRESS);
          encryptedMarker3 = m3Enc.handles[0];

          const tempEnc = await fhevmClient.encrypt(temperament, 'euint8', CONTRACT_ADDRESS);
          encryptedTemperament = tempEnc.handles[0];

          onSuccess && onSuccess('Data encrypted successfully!');
        } catch (encError) {
          console.warn('SDK encryption failed:', encError);
          encryptedHealth = healthScore;
          encryptedMarker1 = m1;
          encryptedMarker2 = m2;
          encryptedMarker3 = m3;
          encryptedTemperament = temperament;
        }
      } else {
        encryptedHealth = healthScore;
        encryptedMarker1 = m1;
        encryptedMarker2 = m2;
        encryptedMarker3 = m3;
        encryptedTemperament = temperament;
      }

      const tx = await contract.registerPet(
        petName,
        species,
        petBreed,
        birthYear,
        encryptedHealth,
        encryptedMarker1,
        encryptedMarker2,
        encryptedMarker3,
        encryptedTemperament
      );

      onSuccess && onSuccess('Transaction sent, waiting for confirmation...');
      const receipt = await tx.wait();

      // Clear form
      setPetData({
        petName: '',
        petBreed: '',
        petAge: '',
        marker1: '',
        marker2: '',
        marker3: '',
        marker4: '',
        healthRisk: ''
      });

      onSuccess && onSuccess(`Pet registered successfully! TX: ${receipt.transactionHash}`);

    } catch (error) {
      console.error('Registration failed:', error);
      onError && onError(error.reason || error.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="card">
      <h2>🐕 Pet Registration</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="petName">Pet Name</label>
          <input
            type="text"
            id="petName"
            name="petName"
            placeholder="Enter pet name"
            value={petData.petName}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="petBreed">Breed</label>
          <select
            id="petBreed"
            name="petBreed"
            value={petData.petBreed}
            onChange={handleInputChange}
          >
            <option value="">Select breed</option>
            <option value="Golden Retriever">Golden Retriever</option>
            <option value="Labrador Retriever">Labrador Retriever</option>
            <option value="German Shepherd">German Shepherd</option>
            <option value="Border Collie">Border Collie</option>
            <option value="Poodle">Poodle</option>
            <option value="Samoyed">Samoyed</option>
            <option value="Siberian Husky">Siberian Husky</option>
            <option value="Bichon Frise">Bichon Frise</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="petAge">Age</label>
          <input
            type="number"
            id="petAge"
            name="petAge"
            min="1"
            max="20"
            placeholder="Age in years"
            value={petData.petAge}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="dna-markers">
        <div className="marker">
          <label htmlFor="marker1">Genetic Marker 1 (0-65535)</label>
          <input
            type="number"
            id="marker1"
            name="marker1"
            min="0"
            max="65535"
            placeholder="Marker 1 value"
            value={petData.marker1}
            onChange={handleInputChange}
          />
        </div>
        <div className="marker">
          <label htmlFor="marker2">Genetic Marker 2 (0-65535)</label>
          <input
            type="number"
            id="marker2"
            name="marker2"
            min="0"
            max="65535"
            placeholder="Marker 2 value"
            value={petData.marker2}
            onChange={handleInputChange}
          />
        </div>
        <div className="marker">
          <label htmlFor="marker3">Genetic Marker 3 (0-65535)</label>
          <input
            type="number"
            id="marker3"
            name="marker3"
            min="0"
            max="65535"
            placeholder="Marker 3 value"
            value={petData.marker3}
            onChange={handleInputChange}
          />
        </div>
        <div className="marker">
          <label htmlFor="marker4">Temperament Seed (0-255)</label>
          <input
            type="number"
            id="marker4"
            name="marker4"
            min="0"
            max="255"
            placeholder="Used to calculate temperament (1-10)"
            value={petData.marker4}
            onChange={handleInputChange}
          />
        </div>
        <div className="marker">
          <label htmlFor="healthRisk">Health Risk Score (0-100, lower is better)</label>
          <input
            type="number"
            id="healthRisk"
            name="healthRisk"
            min="0"
            max="100"
            placeholder="Will be converted to health score"
            value={petData.healthRisk}
            onChange={handleInputChange}
          />
        </div>
        <button
          className="btn btn-secondary"
          onClick={generateRandomDNA}
          style={{ marginTop: '10px' }}
        >
          🎲 Generate Random DNA
        </button>
      </div>

      <button
        className="btn"
        onClick={registerPet}
        disabled={isRegistering}
        style={{ marginTop: '20px' }}
      >
        {isRegistering ? 'Registering...' : 'Register Pet'}
      </button>
    </div>
  );
};

export default PetRegistration;

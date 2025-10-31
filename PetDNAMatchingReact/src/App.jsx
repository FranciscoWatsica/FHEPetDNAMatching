import React, { useState } from 'react';
import { useWallet } from './hooks/useWallet';
import WalletConnection from './components/WalletConnection';
import PetRegistration from './components/PetRegistration';
import MyPets from './components/MyPets';
import MatchingService from './components/MatchingService';
import ContractInfo from './components/ContractInfo';
import './App.css';

function App() {
  const {
    account,
    balance,
    contract,
    fhevmClient,
    isConnected,
    isInitializing,
    error,
    connectWallet
  } = useWallet();

  const [statusMessage, setStatusMessage] = useState(null);
  const [pets, setPets] = useState([]);

  const showStatus = (message, type = 'info') => {
    setStatusMessage({ message, type });
    if (type === 'success') {
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handlePetLoadSuccess = (loadedPets) => {
    setPets(loadedPets);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🧬 Private Pet DNA Matching System</h1>
        <p>FHE-powered pet breeding platform that finds optimal breeding partners while protecting genetic privacy and preventing hereditary diseases</p>
      </div>

      <WalletConnection
        account={account}
        balance={balance}
        isConnected={isConnected}
        isInitializing={isInitializing}
        error={error}
        onConnect={connectWallet}
      />

      {isConnected && (
        <>
          <PetRegistration
            contract={contract}
            fhevmClient={fhevmClient}
            onSuccess={(msg) => showStatus(msg, 'success')}
            onError={(msg) => showStatus(msg, 'error')}
          />

          <MyPets
            contract={contract}
            account={account}
            onSuccess={(msg) => showStatus(msg, 'success')}
            onError={(msg) => showStatus(msg, 'error')}
          />

          <MatchingService
            contract={contract}
            pets={pets}
            onSuccess={(msg) => showStatus(msg, 'success')}
            onError={(msg) => showStatus(msg, 'error')}
          />

          <ContractInfo
            contract={contract}
            onSuccess={(msg) => showStatus(msg, 'success')}
            onError={(msg) => showStatus(msg, 'error')}
          />
        </>
      )}

      {statusMessage && (
        <div className={`status ${statusMessage.type}`} style={{ marginTop: '20px' }}>
          {statusMessage.message}
        </div>
      )}
    </div>
  );
}

export default App;

import React from 'react';
import { CONTRACT_ADDRESS } from '../utils/fhevm';

const WalletConnection = ({ account, balance, isConnected, isInitializing, error, onConnect }) => {
  return (
    <div className="card">
      <h2>🔗 Wallet Connection</h2>
      <div className="status success">
        <strong>✅ Contract Deployed!</strong> Connected to Sepolia testnet.<br />
        <strong>Address:</strong> <code>{CONTRACT_ADDRESS}</code><br />
        <strong>Gateway:</strong> API v2.0+ Compatible | <strong>Network:</strong> Sepolia (Chain ID: 11155111)<br />
        <a
          href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#155724' }}
        >
          View on Etherscan →
        </a>
      </div>

      {!isConnected ? (
        <button
          className="btn"
          onClick={onConnect}
          disabled={isInitializing}
        >
          {isInitializing ? 'Connecting...' : 'Connect MetaMask Wallet'}
        </button>
      ) : (
        <div className="wallet-info">
          <p><strong>Address:</strong> {account.substring(0, 6)}...{account.substring(38)}</p>
          <p><strong>Balance:</strong> {balance} ETH</p>
        </div>
      )}

      {error && (
        <div className="status error" style={{ marginTop: '15px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default WalletConnection;

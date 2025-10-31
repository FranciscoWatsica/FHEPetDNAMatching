import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { SimpleFHEVMClient, CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/fhevm';

export const useWallet = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [contract, setContract] = useState(null);
  const [fhevmClient, setFhevmClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(web3Provider);

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      connectWallet();
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const connectWallet = async () => {
    if (!provider) {
      setError('Please install MetaMask');
      return;
    }

    try {
      setIsInitializing(true);
      setError(null);

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        const userAccount = accounts[0];
        const web3Signer = provider.getSigner();

        setAccount(userAccount);
        setSigner(web3Signer);

        // Get balance
        const userBalance = await provider.getBalance(userAccount);
        setBalance(ethers.utils.formatEther(userBalance));

        // Initialize FHEVM SDK
        try {
          const client = new SimpleFHEVMClient(provider, web3Signer, 11155111);
          await client.initialize();
          setFhevmClient(client);
        } catch (fhevmError) {
          console.warn('FHEVM SDK initialization warning:', fhevmError);
          // Continue without SDK for demo purposes
        }

        // Initialize contract
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);
        setContract(contractInstance);

        setIsConnected(true);
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
      setError(err.message);
    } finally {
      setIsInitializing(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setSigner(null);
    setBalance('0');
    setContract(null);
    setFhevmClient(null);
    setIsConnected(false);
  };

  return {
    provider,
    signer,
    account,
    balance,
    contract,
    fhevmClient,
    isConnected,
    isInitializing,
    error,
    connectWallet,
    disconnect
  };
};

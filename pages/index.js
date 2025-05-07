'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RentPayABI from '@/backend/RentPayABI.json';
import { motion } from 'framer-motion';
import EventLogs from '@/components/EventLogs';
import WalletConnect from "../components/WalletConnect";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

const RENTPAY_CONTRACT_ADDRESS = '0xa89273fa3e346007582eff89db7fa41c80c3abb7';
const USDT_ADDRESS = '0x986a2CdeBF0d11572e85540d9e29F0567c2a23ed';
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

// Add USDT ABI
const USDT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Add token decimals mapping
const TOKEN_DECIMALS = {
  [USDT_ADDRESS]: 18, // Your testnet USDT uses 18 decimals
  [USDC_ADDRESS]: 6,  // USDC typically uses 6 decimals
};

const WALLET_OPTIONS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '/metamask.svg',
    description: 'Connect with MetaMask'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '/coinbase.svg',
    description: 'Connect with Coinbase Wallet'
  }
];

export default function Home() {
  
  const [formData, setFormData] = useState({
    amount: '',
    stablecoin: '',
    landlordUPI: '',
    landlordBankDetails: '',
  });

  const [wallet, setWallet] = useState(null);
  const [status, setStatus] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);
  const [allowance, setAllowance] = useState(null);
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);

  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  const [transactionStatus, setTransactionStatus] = useState(null);

  useEffect(() => {
    // Check for existing connections
    const checkExistingConnection = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWallet(accounts[0]);
            setProvider(new ethers.providers.Web3Provider(window.ethereum));
          }
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
        setError('Failed to check existing connection');
      }
    };

    checkExistingConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
        } else {
          setWallet(null);
          setProvider(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  const handleWalletSelect = async (walletId) => {
    setIsConnecting(true);
    setError(null);
    try {
      let newProvider;
      let address;

      switch (walletId) {
        case 'metamask':
          if (!window.ethereum) {
            throw new Error('MetaMask not installed. Please install MetaMask to continue.');
          }
          [address] = await window.ethereum.request({ method: 'eth_requestAccounts' });
          newProvider = new ethers.providers.Web3Provider(window.ethereum);
          break;

        case 'coinbase':
          if (!window.coinbaseWalletExtension) {
            throw new Error('Coinbase Wallet not installed. Please install Coinbase Wallet to continue.');
          }
          [address] = await window.coinbaseWalletExtension.request({ method: 'eth_requestAccounts' });
          newProvider = new ethers.providers.Web3Provider(window.coinbaseWalletExtension);
          break;

        default:
          throw new Error('Unsupported wallet type');
      }

      // Check if we're on Base Sepolia
      const network = await newProvider.getNetwork();
      if (network.chainId !== 84532) {
        try {
          await newProvider.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x14a34' }], // 84532 in hex
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await newProvider.provider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x14a34',
                  chainName: 'Base Sepolia',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://sepolia.base.org'],
                  blockExplorerUrls: ['https://sepolia.basescan.org']
                }]
              });
            } catch (addError) {
              throw new Error('Failed to add Base Sepolia network. Please add it manually in your wallet.');
            }
          } else {
            throw new Error('Failed to switch to Base Sepolia network. Please switch manually in your wallet.');
          }
        }
      }

      setWallet(address);
      setProvider(newProvider);
      setShowWalletModal(false);
      setStatus('✅ Wallet connected successfully!');
    } catch (error) {
      console.error('Wallet connection error:', error);
      setError(error.message || 'Failed to connect wallet');
      setStatus('❌ Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setWallet(null);
      setProvider(null);
      setStatus('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setError('Failed to disconnect wallet');
    }
  };

  const checkAllowance = async (tokenAddress, amount) => {
    if (!provider || !wallet || !tokenAddress || !amount) return;
    
    setIsCheckingAllowance(true);
    try {
      const signer = provider.getSigner();
      const token = new ethers.Contract(tokenAddress, USDT_ABI, signer);
      const contract = new ethers.Contract(RENTPAY_CONTRACT_ADDRESS, RentPayABI, signer);
      
      // Get token decimals dynamically
      const decimals = await token.decimals();
      const amountInUnits = ethers.utils.parseUnits(amount, decimals);
      
      // Get app wallet address
      const appWallet = await contract.appWallet();
      
      // Check balance first
      const balance = await token.balanceOf(wallet);
      if (balance.lt(amountInUnits)) {
        setError(`Insufficient balance. You need ${amount} ${tokenAddress === USDT_ADDRESS ? 'USDT' : 'USDC'}`);
        return false;
      }
      
      // Check allowance
      const currentAllowance = await token.allowance(wallet, appWallet);
      setAllowance(currentAllowance);
      
      return currentAllowance.gte(amountInUnits);
    } catch (error) {
      console.error('Error checking allowance:', error);
      if (error.code === 'CALL_EXCEPTION') {
        setError('Failed to interact with token contract. Please check if you are on the correct network.');
      } else {
        setError(`Failed to check token allowance: ${error.message}`);
      }
      return false;
    } finally {
      setIsCheckingAllowance(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle amount input with decimal validation
    if (name === 'amount') {
      // Only allow numbers and one decimal point
      const regex = /^\d*\.?\d*$/;
      if (!regex.test(value)) return;
      
      // Limit to 18 decimal places
      const parts = value.split('.');
      if (parts[1] && parts[1].length > 18) return;
    }

    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: value,
      };
      
      // Check allowance when amount or token changes
      if ((name === 'amount' || name === 'stablecoin') && newFormData.amount && newFormData.stablecoin) {
        checkAllowance(newFormData.stablecoin, newFormData.amount);
      }
      
      return newFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!provider) {
      setError('Please connect your wallet first');
      return;
    }

    setStatus('Processing...');

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(RENTPAY_CONTRACT_ADDRESS, RentPayABI, signer);
      const token = new ethers.Contract(formData.stablecoin, USDT_ABI, signer);

      // Get token decimals dynamically
      const decimals = await token.decimals();
      const amountInUnits = ethers.utils.parseUnits(formData.amount, decimals);
      const appWallet = await contract.appWallet();

      // Check if we need approval
      const hasEnoughAllowance = await checkAllowance(formData.stablecoin, formData.amount);
      
      if (!hasEnoughAllowance) {
        setStatus('Approving tokens...');
        const approveTx = await token.approve(appWallet, amountInUnits);
        await approveTx.wait();
        setStatus('Approval successful. Proceeding with payment...');
      }

      setStatus('Paying rent...');
      const tx = await contract.payRent(
        amountInUnits,
        formData.stablecoin,
        formData.landlordUPI,
        formData.landlordBankDetails
      );
      await tx.wait();

      setStatus('✅ Rent paid successfully!');
      setFormData({
        amount: '',
        stablecoin: '',
        landlordUPI: '',
        landlordBankDetails: '',
      });
      setAllowance(null);
    } catch (error) {
      console.error('RentPay Error:', error);
      if (error.code === 'CALL_EXCEPTION') {
        setError('Transaction failed. Please check if you are on the correct network and have sufficient balance.');
      } else {
        setError(error.message || 'Transaction failed');
      }
      setStatus('❌ Transaction failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            RentPay
          </h1>
          <p className="text-gray-400 mt-2">Web3 Rent Payments Made Simple</p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 shadow-xl border border-white/20">
              {!wallet ? (
                <div className="text-center space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-100">
                    Connect Your Wallet
                  </h2>
                  <p className="text-gray-400">Choose your preferred wallet to continue</p>

                  <div className="space-y-4">
                    
                    {WALLET_OPTIONS.map((option) => (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleWalletSelect(option.id)}
                        disabled={isConnecting}
                        className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <img src={option.icon} alt={option.name} className="w-6 h-6" />
                        <span>{option.description}</span>
                      </motion.button>
                    ))}
                  </div>

                  {isConnecting && (
                    <div className="flex items-center justify-center space-x-2 text-gray-400">
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-500/20 text-red-400 rounded-lg">
                      {error}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-300">
                        Connected: {wallet.slice(0, 6)}...{wallet.slice(-4)}
                      </span>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="px-4 py-2 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <input
                        name="amount"
                        type="text"
                        placeholder="Amount (USDT/USDC)"
                        value={formData.amount}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                        {formData.stablecoin === USDT_ADDRESS ? 'USDT (18 decimals)' : 'USDC (6 decimals)'}
                      </div>
                    </div>

                    <div className="relative">
                      <select
                        name="stablecoin"
                        value={formData.stablecoin}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Stablecoin</option>
                        <option value={USDT_ADDRESS}>USDT</option>
                        <option value={USDC_ADDRESS}>USDC</option>
                      </select>
                    </div>

                    <div className="relative">
                      <input
                        name="landlordUPI"
                        type="text"
                        placeholder="Landlord UPI "
                        value={formData.landlordUPI}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="relative">
                      <input
                        name="landlordBankDetails"
                        type="text"
                        placeholder="Landlord Bank Details (optional)"
                        value={formData.landlordBankDetails}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {formData.amount && formData.stablecoin && (
                      <div className="text-sm text-gray-400">
                        {isCheckingAllowance ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Checking allowance...</span>
                          </div>
                        ) : allowance && (
                          <div>
                            Current allowance: {ethers.utils.formatUnits(allowance, TOKEN_DECIMALS[formData.stablecoin])} {formData.stablecoin === USDT_ADDRESS ? 'USDT' : 'USDC'}
                          </div>
                        )}
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                    >
                      Pay Rent
                    </motion.button>
                  </form>

                  {error && (
                    <div className="p-4 bg-red-500/20 text-red-400 rounded-lg">
                      {error}
                    </div>
                  )}

                  {status && (
                    <div className={`p-4 rounded-lg ${
                      status.includes('✅') ? 'bg-green-500/20 text-green-400' : 
                      status.includes('❌') ? 'bg-red-500/20 text-red-400' : 
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {status}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 shadow-xl border border-white/20">
              <EventLogs />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

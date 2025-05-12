'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RentPayABI from '@/backend/RentPayABI.json';
import { motion, AnimatePresence } from 'framer-motion';
import EventLogs from '@/components/EventLogs';
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';

const RENTPAY_CONTRACT_ADDRESS = '0xdd2dbee415c911f7a45a8be3f7bdc1d23a05b0f3';
const USDT_ADDRESS = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2';
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';


// Add ERC20 ABI
const ERC20_ABI = [
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
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);
  const [allowance, setAllowance] = useState(null);
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [tokenDecimals, setTokenDecimals] = useState(null);
  const [approvalAmount, setApprovalAmount] = useState('1000'); // Default approval amount
  const [isPaying, setIsPaying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  const [transactionStatus, setTransactionStatus] = useState(null);

  const router = useRouter();

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

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/payouts`)
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        
        // Debug logs
        console.log('Current connected address:', address);
        console.log('All transactions:', data);
        
        // Filter transactions for the connected wallet using address from useAccount
        const filteredData = data.filter(tx => {
          console.log('Comparing:', {
            txTenant: tx.tenant,
            currentAddress: address,
            matches: tx.tenant?.toLowerCase() === address?.toLowerCase()
          });
          return tx.tenant?.toLowerCase() === address?.toLowerCase();
        });
        
        console.log('Filtered transactions:', filteredData);
        setRecentTransactions(filteredData);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      }
    };

    if (address) {
      console.log('Fetching transactions for address:', address);
      fetchTransactions();
      const interval = setInterval(fetchTransactions, 5000);
      return () => clearInterval(interval);
    } else {
      console.log('No address connected, clearing transactions');
      setRecentTransactions([]);
    }
  }, [address]);

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

        case 'walletconnect':
          if (!window.walletConnect) {
            throw new Error('WalletConnect not installed. Please install WalletConnect to continue.');
          }
          [address] = await window.walletConnect.connectTo(walletId);
          newProvider = new ethers.providers.Web3Provider(window.walletConnect);
          break;

        default:
          throw new Error('Unsupported wallet type');
      }

      // Check if we're on Base 
      const network = await newProvider.getNetwork();
      if (network.chainId !== 8453) {
        try {
          await newProvider.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }], // 84532 in hex
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await newProvider.provider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x2105',
                  chainName: 'Base Mainnet',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://base-mainnet.infura.io'],
                  blockExplorerUrls: ['https://basescan.org']
                }]
              });
            } catch (addError) {
              throw new Error('Failed to add Base network. Please add it manually in your wallet.');
            }
          } else {
            throw new Error('Failed to switch to Base network. Please switch manually in your wallet.');
          }
        }
      }

      setWallet(address);
      setProvider(newProvider);
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
      await disconnect();
      setWallet(null);
      setProvider(null);
      setStatus('Wallet disconnected');
      router.push('/'); // Redirect to index page after disconnecting
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
      // Use ERC20_ABI for both USDT and USDC
      const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
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
      const currentAllowance = await token.allowance(wallet, RENTPAY_CONTRACT_ADDRESS);
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

  const getTokenDecimals = async (tokenAddress) => {
    if (!provider || !tokenAddress) return;
    try {
      // Use ERC20_ABI for both USDT and USDC
      const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const decimals = await token.decimals();
      setTokenDecimals(decimals);
      return decimals;
    } catch (error) {
      console.error('Error getting token decimals:', error);
      return null;
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
      
      // Get token decimals and check allowance when token changes
      if (name === 'stablecoin' && newFormData.stablecoin) {
        getTokenDecimals(newFormData.stablecoin);
      }
      
      // Check allowance when amount or token changes
      if ((name === 'amount' || name === 'stablecoin') && newFormData.amount && newFormData.stablecoin) {
        checkAllowance(newFormData.stablecoin, newFormData.amount);
      }
      
      return newFormData;
    });
  };

  const handleApproveMax = async () => {
    if (!provider) {
      setError('Please connect your wallet first');
      return;
    }

    if (!formData.stablecoin) {
      setError('Please select a token (USDT or USDC) first');
      return;
    }

    setStatus('Processing approval...');
    try {
      const signer = provider.getSigner();
      const token = new ethers.Contract(formData.stablecoin, ERC20_ABI, signer);
      const contract = new ethers.Contract(RENTPAY_CONTRACT_ADDRESS, RentPayABI, signer);
      const appWallet = await contract.appWallet();

      // Get token decimals dynamically
      const decimals = await token.decimals();
      // For USDT/USDC (6 decimals), 1000 tokens = 1000000000
      const amountInUnits = ethers.utils.parseUnits("1000000", decimals); // 1 million tokens

      // Check balance first
      const balance = await token.balanceOf(wallet);
      if (balance.lt(amountInUnits)) {
        setError(`Insufficient balance. You need 1,000,000 ${formData.stablecoin === USDT_ADDRESS ? 'USDT' : 'USDC'}`);
        return;
      }

      console.log('Approving tokens:', {
        token: formData.stablecoin,
        amount: amountInUnits.toString(),
        appWallet,
        decimals,
        humanReadableAmount: ethers.utils.formatUnits(amountInUnits, decimals)
      });

      const approveTx = await token.approve(RENTPAY_CONTRACT_ADDRESS, amountInUnits);
      console.log('Approval transaction sent:', approveTx.hash);
      await approveTx.wait();
      console.log('Approval transaction confirmed');
      
      setStatus('✅ Approval successful! You can now make multiple payments up to 1,000,000 tokens.');
      setAllowance(amountInUnits);
    } catch (error) {
      console.error('Approval Error:', error);
      if (error.code === 'CALL_EXCEPTION') {
        setError('Failed to interact with token contract. Please check if you are on the correct network.');
      } else {
        setError(error.message || 'Approval failed');
      }
      setStatus('❌ Approval failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!provider) {
      setError('Please connect your wallet first');
      return;
    }
    setStatus('Processing...');
    setIsPaying(true);
    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(RENTPAY_CONTRACT_ADDRESS, RentPayABI, signer);
      const token = new ethers.Contract(formData.stablecoin, ERC20_ABI, signer);
      const decimals = await token.decimals();
      const amountInUnits = ethers.utils.parseUnits(formData.amount, decimals);
      // Check current allowance
      const currentAllowance = await token.allowance(wallet, RENTPAY_CONTRACT_ADDRESS);
      if (currentAllowance.lt(amountInUnits)) {
        setStatus('Approving tokens...');
        const maxApprovalAmount = ethers.utils.parseUnits("1000000", decimals);
        const approveTx = await token.approve(RENTPAY_CONTRACT_ADDRESS, maxApprovalAmount);
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
      setIsPaying(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    } catch (error) {
      setIsPaying(false);
      console.error('RentPay Error:', error);
      if (error.code === 'CALL_EXCEPTION') {
        setError('Transaction failed. Please check if you are on the correct network and have sufficient balance.');
      } else if (error.message.includes('transfer amount exceeds allowance')) {
        setError('Insufficient token allowance. Please try the transaction again.');
      } else {
        setError(error.message || 'Transaction failed');
      }
      setStatus('❌ Transaction failed');
    }
  };

  return (
    <Layout>
      {/* Loader Modal */}
      <AnimatePresence>
        {isPaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="flex flex-col items-center justify-center p-8 bg-black/80 rounded-2xl shadow-2xl border border-white/10"
            >
              <svg className="animate-spin h-16 w-16 text-blue-400 mb-6" viewBox="0 0 50 50">
                <circle className="opacity-20" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" />
                <circle className="opacity-80" cx="25" cy="25" r="20" stroke="#6366f1" strokeWidth="5" fill="none" strokeDasharray="100" strokeDashoffset="60" />
              </svg>
              <div className="text-lg text-white font-semibold mb-2">Processing Payment</div>
              <div className="text-sm text-gray-300">Please confirm the transaction in your wallet.<br/>Do not close this window.</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="flex flex-col items-center justify-center p-8 bg-black/90 rounded-2xl shadow-2xl border border-white/10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="mb-6"
              >
                <svg className="h-20 w-20 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#22c55e22" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2 2l4-4" />
                </svg>
              </motion.div>
              <div className="text-2xl font-bold text-green-400 mb-2">Rent Paid Successfully!</div>
              <div className="text-gray-200 text-center mb-4">Your rent payment was confirmed on-chain.<br/>Thank you for using RentPay.</div>
              <button
                onClick={() => setShowSuccess(false)}
                className="mt-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            RentPay Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Manage your rent payments</p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="backdrop-blur-lg bg-black/50 border border-white/10 rounded-2xl p-6 shadow-xl">
              {!wallet ? (
                <div className="text-center space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-100">
                    Connect Your Wallet
                  </h2>
                  <p className="text-gray-400">Choose your preferred wallet to continue</p>

                  <div className="space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleWalletSelect('metamask')}
                      disabled={isConnecting}
                      className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>🦊</span>
                      <span>Connect with MetaMask</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleWalletSelect('walletconnect')}
                      disabled={isConnecting}
                      className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>🔗</span>
                      <span>Connect with WalletConnect</span>
                    </motion.button>
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
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        placeholder="Landlord UPI"
                        value={formData.landlordUPI}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="relative">
                      <input
                        name="landlordBankDetails"
                        type="text"
                        placeholder="Landlord Bank Details (optional)"
                        value={formData.landlordBankDetails}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      Pay Rent
                    </motion.button>
                  </form>
                </div>
              )}
            </div>

            <div className="backdrop-blur-lg bg-black/50 border border-white/10 rounded-2xl p-6 shadow-xl ">
            <div className="mt-2">
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">Recent Transactions</h2>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <p className="text-gray-400">No transactions found</p>
              ) :  (
                recentTransactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/30 border border-white/10 rounded-xl p-6 hover:bg-black/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Rent Payment
                        </h3>
                        <p className="text-sm text-gray-400">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-white">
                          {tx.amount} USDT
                        </p>
                        {/* Add INR conversion logic here */}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            </div>
            </div>
          </div>

          {/* Recent Transactions Section */}
         
        </main>
      </div>
    </Layout>
  );
}
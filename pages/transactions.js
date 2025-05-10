import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import Sidebar from '@/components/dashboard/Sidebar';
import { getUSDTToINRRate, convertToINR } from '@/utils/currency';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inrRate, setInrRate] = useState(null);
  const [userType, setUserType] = useState(null); // 'tenant' or 'landlord'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const { address } = useAccount();

  const [filters, setFilters] = useState({
    dateRange: 'all',
    stablecoin: 'all',
    status: 'all'
  });

  useEffect(() => {
    // Check if user is logged in as landlord or tenant
    const landlordUPI = sessionStorage.getItem('landlordUPI');
    if (landlordUPI) {
      setUserType('landlord');
    } else if (address) {
      setUserType('tenant');
    } else {
      router.push('/'); // Redirect to home if not logged in
      return;
    }
  }, [address, router]);

  const fetchTransactions = async () => {
    if (!userType) return; // Don't fetch if user type is not determined

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/payouts`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      
      // Filter transactions based on user type
      let filteredData;
      if (userType === 'landlord') {
        const landlordUPI = sessionStorage.getItem('landlordUPI');
        filteredData = data.filter(tx => tx.landlordUPI === landlordUPI);
      } else {
        // For tenants, filter by wallet address
        filteredData = data.filter(tx => tx.tenant?.toLowerCase() === address?.toLowerCase());
      }
      
      console.log('Fetched transactions:', filteredData);
      setTransactions(filteredData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userType) {
      setLoading(true);
      fetchTransactions();
      const interval = setInterval(fetchTransactions, 5000);
      return () => clearInterval(interval);
    }
  }, [userType, address]);

  useEffect(() => {
    async function fetchRate() {
      try {
        const rate = await getUSDTToINRRate();
        setInrRate(rate);
      } catch (err) {
        console.error("Failed to fetch INR rate:", err);
      }
    }
    fetchRate();
    const rateInterval = setInterval(fetchRate, 60000);
    return () => clearInterval(rateInterval);
  }, []);

  const filterTransactions = (transactions, filters) => {
    return transactions.filter(tx => {
      const date = new Date(tx.timestamp);
      const now = new Date();
      
      if (filters.dateRange !== 'all') {
        const days = parseInt(filters.dateRange);
        const cutoff = new Date(now.setDate(now.getDate() - days));
        if (date < cutoff) return false;
      }
      
      if (filters.stablecoin !== 'all' && tx.stablecoin !== filters.stablecoin) {
        return false;
      }
      
      if (filters.status !== 'all' && tx.status !== filters.status) {
        return false;
      }
      
      return true;
    });
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-400';
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredTransactions = filterTransactions(transactions, filters);

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-72 bg-black/50 border-r border-white/10 backdrop-blur-lg">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              />
              
              {/* Sidebar */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 20 }}
                className="fixed top-0 left-0 h-full w-72 bg-black/90 border-r border-white/10 backdrop-blur-lg z-50 lg:hidden"
              >
                <div className="p-4">
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <Sidebar />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <header className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                {/* Hamburger Menu Button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Transactions
                  </h1>
                  <p className="text-gray-400 mt-2">View and manage your payment history</p>
                </div>
              </div>
              <div className="text-gray-400 text-sm lg:text-base">
                {userType === 'landlord' ? (
                  <span className="truncate">Viewing as Landlord: {sessionStorage.getItem('landlordUPI')}</span>
                ) : (
                  <span>Viewing as Tenant: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
                )}
              </div>
            </header>

            {/* Filters */}
            <div className="mb-8">
              <div className="backdrop-blur-lg bg-black/40 border border-white/10 rounded-2xl p-4 lg:p-6 shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                    className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white w-full"
                  >
                    <option value="all">All Time</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                  </select>

                  <select
                    value={filters.stablecoin}
                    onChange={(e) => setFilters({ ...filters, stablecoin: e.target.value })}
                    className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white w-full"
                  >
                    <option value="all">All Stablecoins</option>
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                  </select>

                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white w-full"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="backdrop-blur-lg bg-black/40 border border-white/10 rounded-2xl p-4 lg:p-6 shadow-xl">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-8">{error}</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No transactions found</div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map((tx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-black/30 border border-white/10 rounded-xl p-4 lg:p-6 hover:bg-black/40 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
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
                          {inrRate && (
                            <p className="text-sm text-gray-400">
                              ≈ ₹{convertToINR(tx.amount, inrRate)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Transaction Hash:</p>
                          <p className="text-white font-mono text-xs truncate">{tx.txHash}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Status:</p>
                          <p className="text-green-400">
                            Success
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">From:</p>
                          <p className="text-white font-mono text-xs truncate">{tx.tenant}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">To:</p>
                          <p className="text-white font-mono text-xs truncate">{tx.landlordUPI}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 
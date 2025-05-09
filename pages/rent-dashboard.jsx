import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import OverviewPanel from "@/components/dashboard/OverviewPanel";
import Filters from "@/components/dashboard/Filters";
import RentChart from "@/components/dashboard/RentChart";
import TriggerLog from "@/components/dashboard/TriggerLog";
import ConnectWallet from "@/components/dashboard/ConnectWallet";
import { getUSDTToINRRate, convertToINR } from "@/utils/currency";
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';

const USDT_ADDRESS = '0x986a2CdeBF0d11572e85540d9e29F0567c2a23ed';
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

export default function PayoutDashboard() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inrRate, setInrRate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [landlordUPI, setLandlordUPI] = useState(null);
  const router = useRouter();

  const [filters, setFilters] = useState({
    dateRange: 'all',
    stablecoin: 'all',
    status: 'all'
  });

  useEffect(() => {
    // Check for landlord UPI in session storage
    const storedUPI = sessionStorage.getItem('landlordUPI');
    if (!storedUPI) {
      router.push('/'); // Redirect to home if no UPI session
      return;
    }
    setLandlordUPI(storedUPI);
    setLoading(false); // Set loading to false after UPI is set
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('landlordUPI');
    router.push('/');
  };

  const fetchPayouts = async () => {
    if (!landlordUPI) return; // Don't fetch if no UPI
    
    try {
      const res = await fetch("http://localhost:3001/payouts");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      // Filter transactions for the logged-in landlord using session UPI
      const filteredData = data.filter(payout => payout.landlordUPI === landlordUPI);
      console.log('Fetched payouts:', filteredData);
      setPayouts(filteredData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch payouts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (landlordUPI) {
      setLoading(true); // Set loading to true before fetching
      fetchPayouts();
      const interval = setInterval(fetchPayouts, 5000);
      return () => clearInterval(interval);
    }
  }, [landlordUPI]);

  useEffect(() => {
    async function fetchRate() {
      try {
        const rate = await getUSDTToINRRate();
        setInrRate(rate);
      } catch (err) {
        console.error("Failed to fetch INR rate:", err);
        // Don't set error state here as it's not critical
      }
    }
    fetchRate();
    const rateInterval = setInterval(fetchRate, 60000); // Update rate every minute
    return () => clearInterval(rateInterval);
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  // Calculate stats from filtered data
  const calculateStats = () => {
    const filteredPayouts = filterPayouts(payouts, filters);
    
    if (!filteredPayouts.length) return {
      totalRent: "0.00",
      totalRentFiat: "0.00",
      walletBalance: "0.00",
      walletBalanceFiat: "0.00",
      conversionRate: inrRate?.toString() || "0.00",
      lastUpdated: new Date().toLocaleTimeString()
    };

    const totalRent = filteredPayouts.reduce((sum, payout) => {
      const amount = payout.amount;
      return sum + parseFloat(amount);
    }, 0);
    
    const totalRentInr = inrRate ? convertToINR(totalRent, inrRate) : "0.00";

    return {
      totalRent: totalRent.toFixed(2),
      totalRentFiat: totalRentInr,
      walletBalance: "0.00", // This would come from wallet balance
      walletBalanceFiat: "0.00",
      conversionRate: inrRate?.toString() || "0.00",
      lastUpdated: new Date().toLocaleTimeString()
    };
  };

  // Filter payouts based on selected filters
  const filterPayouts = (payouts, filters) => {
    return payouts.filter(payout => {
      const date = new Date(payout.timestamp);
      const now = new Date();
      
      // Date range filter
      if (filters.dateRange !== 'all') {
        const days = parseInt(filters.dateRange);
        const cutoff = new Date(now.setDate(now.getDate() - days));
        if (date < cutoff) return false;
      }
      
      // Stablecoin filter
      if (filters.stablecoin !== 'all' && payout.stablecoin !== filters.stablecoin) {
        return false;
      }
      
      return true;
    });
  };

  // Format chart data from filtered payouts
  const formatChartData = () => {
    const filteredPayouts = filterPayouts(payouts, filters);
    
    if (!filteredPayouts.length) return {
      labels: [],
      values: []
    };

    // Group payouts by date
    const groupedPayouts = filteredPayouts.reduce((acc, payout) => {
      const date = new Date(payout.timestamp).toLocaleDateString();
      const amount = payout.amount;
      acc[date] = (acc[date] || 0) + parseFloat(amount);
      return acc;
    }, {});

    return {
      labels: Object.keys(groupedPayouts),
      values: Object.values(groupedPayouts)
    };
  };

  // Format payouts for display
  const formattedPayouts = filterPayouts(payouts, filters).map(payout => ({
    ...payout,
    formattedAmount: payout.amount // use directly if already formatted from backend
  }));
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-lg text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <div className="text-red-500 text-4xl">⚠️</div>
            <p className="text-red-500 text-lg">Error: {error}</p>
            <button 
              onClick={fetchPayouts}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-64 bg-black/50 border-r border-white/10 backdrop-blur-lg">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pb-16">
          <div className="container mx-auto px-4 py-8">
            <header className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  RentPay Dashboard
                </h1>
                <p className="text-gray-400 mt-2">Track your rent payments and payouts</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">UPI: {landlordUPI}</span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Logout
                </motion.button>
              </div>
            </header>

            {/* Overview Panel */}
            <div className="mb-8">
              <div className="backdrop-blur-lg bg-black/50 border border-white/10 rounded-2xl p-6 shadow-xl">
                <OverviewPanel stats={calculateStats()} />
              </div>
            </div>

            {/* Filters */}
            <div className="mb-8">
              <div className="backdrop-blur-lg bg-black/50 border border-white/10 rounded-2xl p-6 shadow-xl">
                <Filters filters={filters} onFilterChange={handleFilterChange} />
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart */}
              <div className="backdrop-blur-lg bg-black/50 border border-white/10 rounded-2xl p-6 shadow-xl">
                <h2 className="text-2xl font-semibold text-gray-100 mb-4">Payment History</h2>
                <div className="bg-black/30 rounded-xl p-4">
                  <RentChart data={formatChartData()} />
                </div>
              </div>

              {/* Trigger Log */}
              <div className="backdrop-blur-lg bg-black/50 border border-white/10 rounded-2xl p-6 shadow-xl">
                <h2 className="text-2xl font-semibold text-gray-100 mb-4">Recent Transactions</h2>
                <div className="bg-black/30 rounded-xl p-4">
                  <TriggerLog 
                    inrRate={inrRate}
                    events={formattedPayouts} 
                    onEventClick={handleEventClick}
                    selectedEvent={selectedEvent}
                  />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-8 p-4 bg-red-500/20 text-red-400 rounded-lg backdrop-blur-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

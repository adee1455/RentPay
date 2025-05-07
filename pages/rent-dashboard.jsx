import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import OverviewPanel from "@/components/dashboard/OverviewPanel";
import Filters from "@/components/dashboard/Filters";
import RentChart from "@/components/dashboard/RentChart";
import TriggerLog from "@/components/dashboard/TriggerLog";
import ConnectWallet from "@/components/dashboard/ConnectWallet";
import { getUSDTToINRRate, convertToINR } from "@/utils/currency";

const USDT_ADDRESS = '0x986a2CdeBF0d11572e85540d9e29F0567c2a23ed';
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

export default function PayoutDashboard() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inrRate, setInrRate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    stablecoin: 'all',
    status: 'all'
  });

  const fetchPayouts = async () => {
    try {
      const res = await fetch("http://localhost:3001/payouts");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log('Fetched payouts:', data);
      setPayouts(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch payouts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
    const interval = setInterval(fetchPayouts, 5000);
    return () => clearInterval(interval);
  }, []);

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
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-lg text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-4xl">⚠️</div>
          <p className="text-red-500 text-lg">Error: {error}</p>
          <button 
            onClick={fetchPayouts}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar />
      
      <main className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-teal-400 to-purple-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          {/* <ConnectWallet isConnected={isConnected} onConnect={handleConnectWallet} /> */}
        </div>

        <OverviewPanel stats={calculateStats()} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Filters onFilterChange={handleFilterChange} />
            <RentChart data={formatChartData()} />
          </div>
          
          <div>
            <TriggerLog 
              inrRate={inrRate}
              events={formattedPayouts} 
              onEventClick={handleEventClick}
              selectedEvent={selectedEvent}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

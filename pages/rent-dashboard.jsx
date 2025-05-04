import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import Sidebar from "@/components/dashboard/Sidebar";
import OverviewPanel from "@/components/dashboard/OverviewPanel";
import Filters from "@/components/dashboard/Filters";
import RentChart from "@/components/dashboard/RentChart";
import TriggerLog from "@/components/dashboard/TriggerLog";
import ConnectWallet from "@/components/dashboard/ConnectWallet";
import { getUSDTToINRRate, convertToINR } from "@/utils/currency";

export default function PayoutDashboard() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
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
      const rate = await getUSDTToINRRate();
      setInrRate(rate);
    }
    fetchRate();
    const rateInterval = setInterval(fetchRate, 60000); // Update rate every minute
    return () => clearInterval(rateInterval);
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Implement filtering logic here
  };

  const handleConnectWallet = () => {
    setIsConnected(!isConnected);
    // Implement wallet connection logic here
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  // Format amount from wei to USDT
  const formatAmount = (amount) => {
    try {
      // Sanitize and convert input
      const clean = amount.toString().split('.')[0]; // Remove any decimals
      return ethers.formatUnits(clean, 18);
    } catch (error) {
      console.error('Error formatting amount:', error);
      return '0.00';
    }
  };
  

  // Calculate stats from real data
  const calculateStats = () => {
    if (!payouts.length) return {
      totalRent: "0.00",
      totalRentFiat: "0.00",
      walletBalance: "0.00",
      walletBalanceFiat: "0.00",
      conversionRate: inrRate?.toString() || "0.00",
      lastUpdated: new Date().toLocaleTimeString()
    };

    const totalRent = payouts.reduce((sum, payout) => {
      const amount = formatAmount(payout.amount);
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

  // Format chart data from real payouts
  const formatChartData = () => {
    if (!payouts.length) return {
      labels: [],
      values: []
    };

    // Group payouts by date
    const groupedPayouts = payouts.reduce((acc, payout) => {
      const date = new Date(payout.timestamp).toLocaleDateString();
      const amount = formatAmount(payout.amount);
      acc[date] = (acc[date] || 0) + parseFloat(amount);
      return acc;
    }, {});

    return {
      labels: Object.keys(groupedPayouts),
      values: Object.values(groupedPayouts)
    };
  };

  // Format payouts for display
  const formattedPayouts = payouts.map(payout => ({
    ...payout,
    formattedAmount: formatAmount(payout.amount)
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
          <ConnectWallet isConnected={isConnected} onConnect={handleConnectWallet} />
        </div>

        <OverviewPanel stats={calculateStats()} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Filters onFilterChange={handleFilterChange} />
            <RentChart data={formatChartData()} />
          </div>
          
          <div>
            <TriggerLog 
              events={formattedPayouts} 
              onEventClick={handleEventClick}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

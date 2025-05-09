import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import Sidebar from '@/components/dashboard/Sidebar';
import { getUSDTToINRRate, convertToINR } from '@/utils/currency';
import { useRouter } from 'next/router';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

export default function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inrRate, setInrRate] = useState(null);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [landlordUPI, setLandlordUPI] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check for landlord UPI in session storage
    const storedUPI = sessionStorage.getItem('landlordUPI');
    if (!storedUPI) {
      router.push('/'); // Redirect to home if no UPI session
      return;
    }
    setLandlordUPI(storedUPI);
  }, [router]);

  const fetchTransactions = async () => {
    if (!landlordUPI) return; // Don't fetch if no UPI

    try {
      const res = await fetch("http://localhost:3001/payouts");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      
      // Filter transactions for the logged-in landlord
      const filteredData = data.filter(tx => tx.landlordUPI === landlordUPI);
      console.log('Fetched transactions for analytics:', filteredData);
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
    if (landlordUPI) {
      setLoading(true);
      fetchTransactions();
      const interval = setInterval(fetchTransactions, 5000);
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
      }
    }
    fetchRate();
    const rateInterval = setInterval(fetchRate, 60000);
    return () => clearInterval(rateInterval);
  }, []);

  const processData = () => {
    if (!transactions.length) return {
      dailyData: [],
      stablecoinDistribution: [],
      statusDistribution: [],
      totalVolume: 0,
      totalTransactions: 0,
      averageTransaction: 0
    };

    const now = new Date();
    const cutoff = new Date(now.setDate(now.getDate() - parseInt(timeRange)));

    const filteredTransactions = transactions.filter(tx => 
      new Date(tx.timestamp) >= cutoff
    );

    // Daily volume data
    const dailyData = filteredTransactions.reduce((acc, tx) => {
      const date = new Date(tx.timestamp).toLocaleDateString();
      const amount = parseFloat(tx.amount);
      acc[date] = (acc[date] || 0) + amount;
      return acc;
    }, {});

    const dailyDataArray = Object.entries(dailyData).map(([date, amount]) => ({
      date,
      amount,
      inrAmount: inrRate ? convertToINR(amount, inrRate) : 0
    }));

    // Stablecoin distribution
    const stablecoinData = filteredTransactions.reduce((acc, tx) => {
      acc[tx.stablecoin] = (acc[tx.stablecoin] || 0) + parseFloat(tx.amount);
      return acc;
    }, {});

    const stablecoinDistribution = Object.entries(stablecoinData).map(([name, value]) => ({
      name,
      value
    }));

    // Status distribution
    const statusData = filteredTransactions.reduce((acc, tx) => {
      acc[tx.status] = (acc[tx.status] || 0) + 1;
      return acc;
    }, {});

    const statusDistribution = Object.entries(statusData).map(([name, value]) => ({
      name,
      value
    }));

    // Calculate totals
    const totalVolume = filteredTransactions.reduce((sum, tx) => 
      sum + parseFloat(tx.amount), 0
    );
    const totalTransactions = filteredTransactions.length;
    const averageTransaction = totalVolume / totalTransactions;

    return {
      dailyData: dailyDataArray,
      stablecoinDistribution,
      statusDistribution,
      totalVolume,
      totalTransactions,
      averageTransaction
    };
  };

  const data = processData();

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)]">
        <div className="w-72 bg-black/50 border-r border-white/10 backdrop-blur-lg">
          <Sidebar />
        </div>

        <div className="flex-1 overflow-y-auto pb-16">
          <div className="container mx-auto px-4 py-8">
            <header className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Analytics
                </h1>
                <p className="text-gray-400 mt-2">Track your payment performance</p>
              </div>
              <div className="text-gray-400">
                <span>Viewing as Landlord: {landlordUPI}</span>
              </div>
            </header>

            {/* Time Range Selector */}
            <div className="mb-8">
              <div className="backdrop-blur-lg bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white"
                >
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="365">Last Year</option>
                </select>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="backdrop-blur-lg bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-gray-400 mb-2">Total Volume</h3>
                <p className="text-2xl font-bold text-white">
                  {data.totalVolume.toFixed(2)} USDT
                </p>
                {inrRate && (
                  <p className="text-gray-400">
                    ≈ ₹{convertToINR(data.totalVolume, inrRate)}
                  </p>
                )}
              </div>

              <div className="backdrop-blur-lg bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-gray-400 mb-2">Total Transactions</h3>
                <p className="text-2xl font-bold text-white">
                  {data.totalTransactions}
                </p>
              </div>

              <div className="backdrop-blur-lg bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-gray-400 mb-2">Average Transaction</h3>
                <p className="text-2xl font-bold text-white">
                  {data.averageTransaction.toFixed(2)} USDT
                </p>
                {inrRate && (
                  <p className="text-gray-400">
                    ≈ ₹{convertToINR(data.averageTransaction, inrRate)}
                  </p>
                )}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Volume Chart */}
              <div className="backdrop-blur-lg bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-4">Payment Volume</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="date" stroke="#ffffff40" />
                      <YAxis stroke="#ffffff40" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#3B82F6"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stablecoin Distribution */}
              <div className="backdrop-blur-lg bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-4">Stablecoin Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.stablecoinDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {data.stablecoinDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        itemStyle={{ color: 'white' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="backdrop-blur-lg bg-black/40 border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-4">Transaction Status</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.statusDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {data.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                        itemStyle={{ color: 'white' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 
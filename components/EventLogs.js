import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function EventLogs() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:3001/payouts');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    // Set up polling every 5 seconds
    const interval = setInterval(fetchEvents, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount, stablecoin) => {
    return `${amount} ${stablecoin === '0x986a2CdeBF0d11572e85540d9e29F0567c2a23ed' ? 'USDT' : 'USDC'}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const openExplorer = (txHash) => {
    window.open(`https://sepolia.basescan.org/tx/${txHash}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/20 text-red-400 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-100">Recent Transactions</h2>
      <div className="space-y-2">
        {events.map((event, index) => (
          <motion.div
            key={event.txHash}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="text-sm text-gray-400">
                  From: {formatAddress(event.tenant)}
                </div>
                <div className="text-lg font-medium text-white">
                  {formatAmount(event.amount, event.stablecoin)}
                </div>
                {event.landlordUPI && (
                  <div className="text-sm text-gray-400">
                    UPI: {event.landlordUPI}
                  </div>
                )}
                {event.landlordBankDetails && (
                  <div className="text-sm text-gray-400">
                    Bank: {event.landlordBankDetails}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {formatDate(event.timestamp)}
                </div>
              </div>
              <button
                onClick={() => openExplorer(event.txHash)}
                className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
              >
                View on Explorer
              </button>
            </div>
          </motion.div>
        ))}
        {events.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No transactions found
          </div>
        )}
      </div>
    </div>
  );
} 
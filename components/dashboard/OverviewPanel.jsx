import { motion } from 'framer-motion';

export default function OverviewPanel({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg border border-gray-700/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Rent This Month</p>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
              {stats.totalRent} USDT
            </h3>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10">
            <span className="text-2xl">💰</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-gray-400 text-sm">≈ ${stats.totalRentFiat}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg border border-gray-700/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Wallet Balance</p>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">
              {stats.walletBalance} USDT
            </h3>
          </div>
          <div className="p-3 rounded-lg bg-teal-500/10">
            <span className="text-2xl">💎</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-gray-400 text-sm">≈ ${stats.walletBalanceFiat}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg border border-gray-700/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Conversion Rate</p>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              1 USDT = ₹{stats.conversionRate}
            </h3>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10">
            <span className="text-2xl">📈</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-gray-400 text-sm">Last updated: {stats.lastUpdated}</p>
        </div>
      </motion.div>
    </div>
  );
} 
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';

const Sidebar = () => {
  const router = useRouter();
  const { address } = useAccount();

  const menuItems = [
    { label: 'Home', icon: '🏠', path: '/' },
    { label: 'Overview', icon: '📊', path: '/rent-dashboard' },
    { label: 'Transactions', icon: '💸', path: '/transactions' },
    { label: 'Analytics', icon: '📈', path: '/analytics' },
  ];

  return (
    <div className="h-full p-6 flex flex-col">
      {/* Logo and Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          RentPay
        </h2>
        <p className="text-sm text-gray-400 mt-1">Landlord Dashboard</p>
      </div>

      {/* Wallet Address */}
      {address && (
        <div className="mb-8 p-4 bg-black/30 border border-white/10 rounded-xl">
          <p className="text-xs text-gray-400 mb-1">Connected Wallet</p>
          <p className="text-sm font-mono text-gray-300 truncate">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <motion.button
            key={item.path}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              router.pathname === item.path
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </motion.button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="space-y-4">
        {/* Back to Home Button - Only show when not on rent-dashboard */}
        
      </div>
    </div>
  );
};

export default Sidebar; 
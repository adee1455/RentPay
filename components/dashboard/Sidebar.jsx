import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const menuItems = [
  { name: 'Home', icon: '🏠', path: '/' },
  { name: 'Rent History', icon: '📊', path: '/rent-history' },
  { name: 'Analytics', icon: '📈', path: '/analytics' },
  { name: 'Settings', icon: '⚙️', path: '/settings' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between mb-8">
        {!isCollapsed && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold bg-gradient-to-r from-blue-400 via-teal-400 to-purple-400 bg-clip-text text-transparent"
          >
            RentPay
          </motion.h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                pathname === item.path
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-l-4 border-blue-400'
                  : 'hover:bg-gray-700/50'
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-200"
                >
                  {item.name}
                </motion.span>
              )}
            </motion.div>
          </Link>
        ))}
      </nav>
    </motion.div>
  );
} 
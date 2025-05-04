import { motion } from 'framer-motion';

export default function ConnectWallet({ isConnected, onConnect }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onConnect}
      className={`relative px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
        isConnected
          ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
      }`}
    >
      <span className="relative z-10 flex items-center">
        {isConnected ? (
          <>
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            Connected
          </>
        ) : (
          <>
            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
            Connect Wallet
          </>
        )}
      </span>
      <motion.div
        className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 opacity-0"
        animate={{
          opacity: [0, 0.5, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.button>
  );
} 
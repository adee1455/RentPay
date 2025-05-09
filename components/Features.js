import { motion } from 'framer-motion';

const features = [
  {
    title: 'Pay with Stablecoins',
    description: 'Use USDC, USDT, or other stablecoins to pay your rent with zero volatility.',
    icon: '💎',
  },
  {
    title: 'Instant INR Payouts',
    description: 'Landlords receive INR directly in their bank account within minutes.',
    icon: '⚡',
  },
  {
    title: 'Secure & Transparent',
    description: 'All transactions are recorded on the blockchain for complete transparency.',
    icon: '🔒',
  },
  {
    title: 'Powered by Web3',
    description: 'Built on WalletConnect & Transak for seamless crypto-to-fiat conversion.',
    icon: '🌐',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Why Choose RentPay?
            </span>
          </h2>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
              <div className="relative p-6 bg-black/50 backdrop-blur-sm rounded-lg border border-white/10">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 
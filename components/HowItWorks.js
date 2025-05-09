import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Connect Wallet',
    description: 'Connect your Web3 wallet (MetaMask, WalletConnect, etc.) to get started.',
    icon: '🔗',
  },
  {
    number: '02',
    title: 'Pay Rent',
    description: 'Select your preferred stablecoin and enter the rent amount.',
    icon: '💸',
  },
  {
    number: '03',
    title: 'Landlord Gets INR',
    description: 'Your landlord receives INR directly in their bank account within minutes.',
    icon: '✅',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connection lines */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-blue-500/50" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                  <div className="relative p-8 bg-black/50 backdrop-blur-sm rounded-lg border border-white/10">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-6">
                      <span className="text-2xl">{step.icon}</span>
                    </div>
                    <div className="text-blue-500 font-bold mb-2">{step.number}</div>
                    <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 
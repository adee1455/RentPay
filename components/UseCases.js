import { motion } from 'framer-motion';

const useCases = [
  {
    title: 'For Tenants',
    description: 'Pay your rent using your crypto holdings. No need to convert to fiat first.',
    icon: '🏠',
    features: [
      'Pay with any supported stablecoin',
      'Set up recurring payments',
      'Track payment history on-chain',
    ],
  },
  {
    title: 'For NRIs',
    description: 'Send rent payments back home without worrying about international transfers.',
    icon: '🌍',
    features: [
      'Avoid high forex fees',
      'Instant settlement',
      'No bank account needed',
    ],
  },
  {
    title: 'For Landlords',
    description: 'Receive rent payments in INR directly to your bank account.',
    icon: '💰',
    features: [
      'Instant INR conversion',
      'Automated payment tracking',
      'Tax-compliant receipts',
    ],
  },
];

const UseCases = () => {
  return (
    <section id="use-cases" className="py-20 px-4 sm:px-6 lg:px-8 bg-black/30">
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
              Perfect For Everyone
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
              <div className="relative p-8 bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 h-full">
                <div className="text-5xl mb-6">{useCase.icon}</div>
                <h3 className="text-2xl font-semibold mb-4">{useCase.title}</h3>
                <p className="text-gray-400 mb-6">{useCase.description}</p>
                <ul className="space-y-3">
                  {useCase.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-300">
                      <svg
                        className="w-5 h-5 text-blue-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases; 
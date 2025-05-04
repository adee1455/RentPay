import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatAmount, getUSDTToINRRate, convertToINR } from '@/utils/currency';
import { ethers } from 'ethers';

export default function EventModal({ event, onClose }) {
  const [inrRate, setInrRate] = useState(null);
  const [loadingRate, setLoadingRate] = useState(true);

  useEffect(() => {
    async function fetchRate() {
      setLoadingRate(true);
      const rate = await getUSDTToINRRate();
      setInrRate(rate);
      setLoadingRate(false);
    }
    fetchRate();
  }, []);

  if (!event) return null;

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

  const formattedAmount = formatAmount(event.amount);
  const inrAmount = inrRate ? convertToINR(formattedAmount, inrRate) : "0.00";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 w-full max-w-2xl relative border border-gray-700/50 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700/50 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Event Details
              </h2>
              <span className="px-3 py-1 rounded-full text-sm bg-green-500/10 text-green-400">
                Success
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Tenant Address</p>
                  <p className="font-mono text-sm bg-gray-700/50 p-3 rounded-lg break-all">
                    {event.tenant}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Amount</p>
                  <div className="space-y-1">
                    <p className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {formattedAmount} USDT
                    </p>
                    {loadingRate ? (
                      <p className="text-sm text-gray-400">Loading INR conversion...</p>
                    ) : (
                      <p className="text-sm text-gray-400">
                        ≈ ₹{inrAmount} INR
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Transaction Hash</p>
                  <a
                    href={`https://sepolia.basescan.org/tx/${event.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-blue-400 hover:text-blue-300 break-all block bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700/70 transition-colors"
                  >
                    {event.txHash}
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Timestamp</p>
                  <p className="text-gray-200">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Event Type</p>
                  <p className="text-gray-200">{event.type || 'RentPaid'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <p className="text-green-400">Completed</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-200 mb-3">Payment Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">UPI ID</p>
                  <p className="font-mono text-sm bg-gray-700/50 p-3 rounded-lg break-all">
                    {event.landlordUPI || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Bank Account Details</p>
                  <p className="font-mono text-sm bg-gray-700/50 p-3 rounded-lg break-all">
                    {event.landlordBankDetails || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-200 mb-3">Additional Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Block Number</p>
                  <p className="text-gray-200">Pending</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Gas Used</p>
                  <p className="text-gray-200">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 
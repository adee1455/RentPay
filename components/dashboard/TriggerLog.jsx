import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EventModal from './EventModal';
import { ethers } from 'ethers';

export default function TriggerLog({ events, onEventClick }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg border border-gray-700/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-200">Event Log</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>

      <div className="h-64 overflow-y-auto space-y-4">
        <AnimatePresence>
          {events.map((event) => (
            <motion.div
              key={event.txHash}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50 cursor-pointer hover:bg-gray-700/50 transition-colors"
              onClick={() => {
                setSelectedEvent(event);
                onEventClick(event);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-200">
                    {event.type || 'RentPaid'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Tenant: {event.tenant.slice(0, 6)}...{event.tenant.slice(-4)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Amount: {formatAmount(event.amount)} 
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-400">
                    Success
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <EventModal 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />
    </motion.div>
  );
} 
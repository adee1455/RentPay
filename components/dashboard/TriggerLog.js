import { motion } from 'framer-motion';

export default function TriggerLog({ inrRate,events, onEventClick, selectedEvent }) {
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAmount = (amount, stablecoin) => {
    try {
      return parseFloat(amount).toFixed(2);
    } catch (error) {
      console.error('Error formatting amount:', error);
      return '0.00';
    }
  };

  const getTokenSymbol = (stablecoin) => {
    return stablecoin === '0x986a2CdeBF0d11572e85540d9e29F0567c2a23ed' ? 'USDT' : 'USDC';
  };

  const openExplorer = (txHash) => {
    window.open(`https://sepolia.basescan.org/tx/${txHash}`, '_blank');
  };

   function convertToINR(usdtAmount, rate) {
    return (parseFloat(usdtAmount) * rate).toFixed(2);
  }

  return (
    <div className="bg-black/30 border-white/10  hover:bg-black/40 transition-colors 0  shadow-lg border  rounded-lg p-4">
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Transaction Log</h2>
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {events.map((event, index) => (
          <motion.div
            key={event.txHash}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onEventClick(event)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedEvent?.txHash === event.txHash
                ? 'bg-blue-500/20 border-blue-500'
                : 'bg-gray-900/50 border-gray-600 hover:border-blue-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="text-sm text-gray-400">
                  From: {formatAddress(event.tenant)}
                </div>
                <div className="text-lg font-medium text-white">
                  {formatAmount(event.formattedAmount)} {getTokenSymbol(event.stablecoin)}
                  <p className="text-gray-400 text-sm">≈ ₹{convertToINR(event.formattedAmount, inrRate)}</p>
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
                onClick={(e) => {
                  e.stopPropagation();
                  openExplorer(event.txHash);
                }}
                className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
              >
                View
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
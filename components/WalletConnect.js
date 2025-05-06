import { useState } from "react";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

export default function WalletConnect({ onConnect }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMetaMask = async () => {
    setIsLoading(true);
    try {
      await onConnect();
    } catch (error) {
      console.error("Failed to connect:", error);
    }
    setIsLoading(false);
  };

  const handleWalletConnect = async () => {
    setIsLoading(true);
    try {
      const connector = new WalletConnectConnector({
        options: {
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
        },
      });
      await onConnect({ connector });
    } catch (error) {
      console.error("Failed to connect:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="text-center space-y-6">
      <h2 className="text-2xl font-semibold text-gray-100">
        Connect Your Wallet
      </h2>
      <p className="text-gray-400">Choose your preferred wallet to continue</p>

      <div className="space-y-4">
        <button
          onClick={handleMetaMask}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img src="/metamask.svg" alt="MetaMask" className="w-6 h-6" />
          <span>Connect with MetaMask</span>
        </button>

        <button
          onClick={handleWalletConnect}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img
            src="/walletconnect.svg"
            alt="WalletConnect"
            className="w-6 h-6"
          />
          <span>Connect with WalletConnect</span>
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center space-x-2 text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Connecting...</span>
        </div>
      )}
    </div>
  );
}

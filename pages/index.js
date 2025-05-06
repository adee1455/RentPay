import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { ethers } from "ethers";
import RentPaymentForm from "../components/RentPaymentForm";
import WalletConnect from "../components/WalletConnect";
import TransactionStatus from "../components/TransactionStatus";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  const [transactionStatus, setTransactionStatus] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            RentPay
          </h1>
          <p className="text-gray-400 mt-2">Web3 Rent Payments Made Simple</p>
        </header>

        <main className="max-w-2xl mx-auto">
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 shadow-xl border border-white/20">
            {!isConnected ? (
              <WalletConnect onConnect={connect} />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-300">
                      Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>

                <RentPaymentForm onTransactionStatus={setTransactionStatus} />

                {transactionStatus && (
                  <TransactionStatus status={transactionStatus} />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

import { useState } from "react";

export default function TransactionStatus({ status }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (status.hash) {
      await navigator.clipboard.writeText(status.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getEtherscanUrl = (hash) => {
    return `https://etherscan.io/tx/${hash}`;
  };

  if (status.type === "pending") {
    return (
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-400">Processing transaction...</span>
        </div>
      </div>
    );
  }

  if (status.type === "success") {
    return (
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-3">
        <div className="flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-green-400">Rent payment successful!</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Transaction Hash:</span>
          <div className="flex items-center space-x-2">
            <code className="text-gray-300">
              {status.hash.slice(0, 6)}...{status.hash.slice(-4)}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-1 hover:bg-white/5 rounded transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
              )}
            </button>
            <a
              href={getEtherscanUrl(status.hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-white/5 rounded transition-colors"
              title="View on Etherscan"
            >
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (status.type === "error") {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <div className="flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-red-400">
            Transaction failed: {status.message}
          </span>
        </div>
      </div>
    );
  }

  return null;
}

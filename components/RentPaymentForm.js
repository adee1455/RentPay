import { useState } from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useContractRead,
} from "wagmi";
import { ethers } from "ethers";

// Contract ABI
const RENTPAY_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_usdtAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "_usdcAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "_appWallet",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "stablecoin",
        type: "address",
      },
      {
        internalType: "string",
        name: "landlordUPI",
        type: "string",
      },
      {
        internalType: "string",
        name: "landlordBankDetails",
        type: "string",
      },
    ],
    name: "payRent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tenant",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "stablecoin",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "landlordUPI",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "landlordBankDetails",
        type: "string",
      },
    ],
    name: "RentPaid",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newWallet",
        type: "address",
      },
    ],
    name: "setAppWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_usdtAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "_usdcAddress",
        type: "address",
      },
    ],
    name: "setStablecoinAddresses",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "appWallet",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "usdcAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "usdtAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
export default function RentPaymentForm({ onTransactionStatus }) {
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const [showBankDetails, setShowBankDetails] = useState(false);

  // Read contract addresses
  const { data: usdtAddress } = useContractRead({
    address: process.env.NEXT_PUBLIC_RENT_CONTRACT_ADDRESS,
    abi: RENTPAY_ABI,
    functionName: "usdtAddress",
  });

  const { data: usdcAddress } = useContractRead({
    address: process.env.NEXT_PUBLIC_RENT_CONTRACT_ADDRESS,
    abi: RENTPAY_ABI,
    functionName: "usdcAddress",
  });

  const [selectedToken, setSelectedToken] = useState({
    id: usdtAddress,
    name: "USDT",
    icon: "/usdt.svg",
  });

  // Update token selection when addresses are loaded
  const STABLECOINS = [
    { id: usdtAddress, name: "USDT", icon: "/usdt.svg" },
    { id: usdcAddress, name: "USDC", icon: "/usdc.svg" },
  ];

  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_RENT_CONTRACT_ADDRESS,
    abi: RENTPAY_ABI,
    functionName: "payRent",
    args: [
      ethers.utils.parseUnits(amount || "0", 18), // Assuming 18 decimals for USDT/USDC
      selectedToken.id,
      upiId,
      bankDetails,
    ],
    enabled: Boolean(amount && selectedToken.id && (upiId || bankDetails)),
  });

  const { data, write } = useContractWrite(config);
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !selectedToken.id || (!upiId && !bankDetails)) return;

    try {
      await write?.();
      onTransactionStatus({ type: "pending", hash: data?.hash });
    } catch (error) {
      console.error("Transaction failed:", error);
      onTransactionStatus({ type: "error", message: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
            placeholder=" "
            required
          />
          <label
            htmlFor="amount"
            className="absolute left-4 top-3 text-gray-400 transition-all duration-200 pointer-events-none"
          >
            Rent Amount
          </label>
        </div>

        <div className="relative">
          <select
            value={selectedToken.id}
            onChange={(e) =>
              setSelectedToken(STABLECOINS.find((t) => t.id === e.target.value))
            }
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 appearance-none"
          >
            {STABLECOINS.map((token) => (
              <option key={token.id} value={token.id}>
                {token.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <img
              src={selectedToken.icon}
              alt={selectedToken.name}
              className="w-6 h-6"
            />
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            id="upiId"
            value={upiId}
            onChange={(e) => {
              setUpiId(e.target.value);
              setShowBankDetails(!e.target.value);
            }}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
            placeholder=" "
          />
          <label
            htmlFor="upiId"
            className="absolute left-4 top-3 text-gray-400 transition-all duration-200 pointer-events-none"
          >
            Landlord UPI ID
          </label>
        </div>

        {showBankDetails && (
          <div className="relative">
            <textarea
              id="bankDetails"
              value={bankDetails}
              onChange={(e) => setBankDetails(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              placeholder=" "
              rows="3"
            />
            <label
              htmlFor="bankDetails"
              className="absolute left-4 top-3 text-gray-400 transition-all duration-200 pointer-events-none"
            >
              Landlord Bank Details
            </label>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={
          isLoading || !amount || !selectedToken.id || (!upiId && !bankDetails)
        }
        className="w-full px-6 py-4 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
      >
        <span className="relative z-10">
          {isLoading ? "Processing..." : "Pay Rent"}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </button>

      <div className="text-sm text-gray-400 text-center">
        <p>Estimated gas fee will be shown in your wallet</p>
      </div>
    </form>
  );
}

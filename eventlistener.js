const { ethers } = require("ethers");
const axios = require("axios");
require('dotenv').config();

// Setup provider (Base testnet - Sepolia)
const provider = new ethers.JsonRpcProvider("https://base-sepolia.alchemyapi.io/v2/7UK233L_8JsWWhSwra9kTnZ5gy73ar-_");

// Contract ABI & Address
const contractAddress = "0xF1f46A7114baE920a803b38E3437B66D503Eccaf"; // RentPay contract address
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_usdtAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_usdcAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_appWallet",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "stablecoin",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "landlordUPI",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "landlordBankDetails",
				"type": "string"
			}
		],
		"name": "payRent",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "tenant",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "stablecoin",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "landlordUPI",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "landlordBankDetails",
				"type": "string"
			}
		],
		"name": "RentPaid",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newWallet",
				"type": "address"
			}
		],
		"name": "setAppWallet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_usdtAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_usdcAddress",
				"type": "address"
			}
		],
		"name": "setStablecoinAddresses",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "appWallet",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "usdcAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "usdtAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const rentPayContract = new ethers.Contract(contractAddress, contractABI, provider);

// Onmeta API Setup
const onmetaApiUrl = "https://stg.api.onmeta.in/v1/offramp/orders/create"; // Replace with actual Onmeta endpoint

const listenToRentPaidEvent = async () => {
  rentPayContract.on("RentPaid", async (tenant, amount, stablecoin, landlordUPI, landlordBankDetails) => {
    console.log(`Rent Paid Event Detected:`);
    console.log(`Tenant: ${tenant}, Amount: ${amount}, Stablecoin: ${stablecoin}`);
    console.log(`Landlord UPI: ${landlordUPI}, Bank Details: ${landlordBankDetails}`);

    // Call Onmeta to convert crypto to INR and send to the landlord
    try {
      const response = await axios.post(onmetaApiUrl, {
        cryptoAmount: amount.toString(),
        cryptoCurrency: stablecoin,
        landlordUPI: landlordUPI,
        landlordBankDetails: landlordBankDetails
      }, {
        headers: {
          "Authorization": `Bearer ${process.env.ONMETA_API_KEY}`,
          "Content-Type": "application/json"
        }
      });

      console.log(`Onmeta Response:`, response.data);
    } catch (error) {
      console.error(`Error sending to Onmeta:`, error);
    }
  });
};

listenToRentPaidEvent().catch((error) => {
  console.error("Error in event listener: ", error);
});

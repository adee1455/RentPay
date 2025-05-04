// Backend: Express listener for RentPay events
// Filename: server.js

import express from 'express';
import { ethers } from 'ethers';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());

const PORT = 3001;

// Replace with your deployed contract details
const RENTPAY_CONTRACT_ADDRESS = '0xa89273fa3e346007582eff89db7fa41c80c3abb7';

// Load ABI file with error handling
let RENTPAY_ABI;
try {
  const abiPath = join(__dirname, 'RentPayABI.json');
  console.log('Loading ABI from:', abiPath);
  const abiContent = readFileSync(abiPath, 'utf8');
  RENTPAY_ABI = JSON.parse(abiContent);
  console.log('ABI loaded successfully');
} catch (error) {
  console.error('Error loading ABI:', error);
  process.exit(1);
}

// Infura setup
const INFURA_API_KEY = 'f173f5c70e3f49bab6870c86a4264773';
const provider = new ethers.InfuraProvider('base-sepolia', INFURA_API_KEY);

// Contract instance
const rentPayContract = new ethers.Contract(RENTPAY_CONTRACT_ADDRESS, RENTPAY_ABI, provider);

// Store simulated payouts in memory
let simulatedPayouts = [];

// Verify contract connection
async function verifyContract() {
  try {
    const usdtAddress = await rentPayContract.usdtAddress();
    const usdcAddress = await rentPayContract.usdcAddress();
    const appWallet = await rentPayContract.appWallet();
    console.log('Contract connection verified:');
    console.log('USDT Address:', usdtAddress);
    console.log('USDC Address:', usdcAddress);
    console.log('App Wallet:', appWallet);
    return true;
  } catch (error) {
    console.error('Error verifying contract:', error);
    return false;
  }
}

// Set up event listener
async function setupEventListener() {
  try {
    console.log('Setting up RentPaid event listener...');
    
    // Use the proper event filter
    const filter = rentPayContract.filters.RentPaid();
    
    // Listen for the RentPaid event
    rentPayContract.addListener(filter, (event) => {
      try {
        console.log('Raw event data:', event);
        
        // Extract event data from the event object
        const tenant = event.args[0];
        const amount = event.args[1];
        const stablecoin = event.args[2];
        const landlordUPI = event.args[3];
        const landlordBankDetails = event.args[4];
        const txHash = event.log.transactionHash;

        console.log('RentPaid event received:');
        console.log('- Tenant:', tenant);
        console.log('- Amount:', amount.toString());
        console.log('- Stablecoin:', stablecoin);
        console.log('- UPI:', landlordUPI);
        console.log('- Bank Details:', landlordBankDetails);
        console.log('- Transaction Hash:', txHash);

        const payout = {
          tenant,
          amount: ethers.formatUnits(amount, 6), // Format the BigNumber amount
          stablecoin,
          landlordUPI,
          landlordBankDetails,
          timestamp: new Date().toISOString(),
          txHash
        };
        
        console.log('Processed payout:', payout);
        simulatedPayouts.unshift(payout);
      } catch (error) {
        console.error('Error processing RentPaid event:', error);
      }
    });

    console.log('Event listener setup complete');
  } catch (error) {
    console.error('Error setting up event listener:', error);
  }
}

// API endpoint to get simulated payouts
app.get('/payouts', (req, res) => {
  console.log('Sending payouts:', simulatedPayouts);
  res.json(simulatedPayouts);
});

// Start the server and initialize contract
app.listen(PORT, async () => {
  console.log(`RentPay backend listening at http://localhost:${PORT}`);
  
  // Verify contract and set up event listener
  const isContractVerified = await verifyContract();
  if (isContractVerified) {
    await setupEventListener();
  } else {
    console.error('Failed to verify contract. Event listener not set up.');
  }
});

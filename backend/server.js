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

// Update contract address to match frontend
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
const provider = new ethers.providers.JsonRpcProvider(`https://base-sepolia.infura.io/v3/${INFURA_API_KEY}`);

// Contract instance
const rentPayContract = new ethers.Contract(RENTPAY_CONTRACT_ADDRESS, RENTPAY_ABI, provider);

// Store simulated payouts in memory
let simulatedPayouts = [];
let lastCheckedBlock = null;
let pollingInterval = null;

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

// Fetch historical events
async function fetchHistoricalEvents() {
  try {
    console.log('Fetching historical RentPaid events...');
    
    // Get the contract creation block or a reasonable starting point
    const startBlock = lastCheckedBlock - 10000; // Look back 10000 blocks
    const endBlock = lastCheckedBlock;
    
    console.log(`Fetching events from block ${startBlock} to ${endBlock}`);
    
    const events = await rentPayContract.queryFilter(
      rentPayContract.filters.RentPaid(),
      startBlock,
      endBlock
    );
    
    console.log(`Found ${events.length} historical events`);
    
    // Process events in reverse chronological order
    for (const event of events.reverse()) {
      await processRentPaidEvent(event);
    }
    
    console.log('Historical events processing complete');
  } catch (error) {
    console.error('Error fetching historical events:', error);
  }
}

// Set up event listener
async function setupEventListener() {
  try {
    console.log('Setting up RentPaid event listener...');
    
    // Get the latest block number
    lastCheckedBlock = await provider.getBlockNumber();
    console.log('Latest block number:', lastCheckedBlock);
    
    // Fetch historical events first
    await fetchHistoricalEvents();
    
    // Start polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    pollingInterval = setInterval(async () => {
      try {
        const latestBlock = await provider.getBlockNumber();
        if (latestBlock > lastCheckedBlock) {
          console.log(`Checking blocks ${lastCheckedBlock + 1} to ${latestBlock}`);
          const events = await rentPayContract.queryFilter(
            rentPayContract.filters.RentPaid(),
            lastCheckedBlock + 1,
            latestBlock
          );
          console.log(`Found ${events.length} new events`);
          for (const event of events) {
            await processRentPaidEvent(event);
          }
          lastCheckedBlock = latestBlock;
        }
      } catch (error) {
        console.error('Error while polling for events:', error);
      }
    }, 15000); // Increased to 15 seconds to avoid rate limiting
    
    console.log('Event listener setup complete');
  } catch (error) {
    console.error('Error setting up event listener:', error);
  }
}

// Process RentPaid event
async function processRentPaidEvent(event) {
  try {
    console.log('Processing RentPaid event:', event);
    
    // Extract event data
    const tenant = event.args[0];
    const amount = event.args[1];
    const stablecoin = event.args[2];
    const landlordUPI = event.args[3];
    const landlordBankDetails = event.args[4];
    const txHash = event.transactionHash;

    // Get token decimals
    const tokenContract = new ethers.Contract(
      stablecoin,
      ['function decimals() view returns (uint8)'],
      provider
    );
    const decimals = await tokenContract.decimals();

    console.log('RentPaid event details:');
    console.log('- Tenant:', tenant);
    console.log('- Amount:', amount.toString());
    console.log('- Stablecoin:', stablecoin);
    console.log('- UPI:', landlordUPI);
    console.log('- Bank Details:', landlordBankDetails);
    console.log('- Transaction Hash:', txHash);
    console.log('- Decimals:', decimals);

    const payout = {
      tenant,
      amount: ethers.utils.formatUnits(amount, decimals),
      stablecoin,
      landlordUPI,
      landlordBankDetails,
      timestamp: new Date().toISOString(),
      txHash
    };
    
    console.log('Processed payout:', payout);
    
    // Add to beginning of array 
    simulatedPayouts.unshift(payout);
    
    // Keep only last 100 payouts
    if (simulatedPayouts.length > 100) {
      simulatedPayouts = simulatedPayouts.slice(0, 100);
    }
  } catch (error) {
    console.error('Error processing RentPaid event:', error);
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
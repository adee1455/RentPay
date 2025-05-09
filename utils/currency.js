import { formatUnits } from 'ethers/utils';
import { ethers } from 'ethers';

// Fetch live USDT to INR rate from an API
export async function getUSDTToINRRate() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=inr');
    const data = await response.json();
    return data.tether.inr;
  } catch (error) {
    console.error('Error fetching USDT rate:', error);
    return 83.5; // Fallback rate
  }
}

// Convert USDT amount to INR
export function convertToINR(usdtAmount, rate) {
  return (parseFloat(usdtAmount) * rate).toFixed(2);
}

// Format amount from wei to USDT
export function formatAmount(amount) {
  try {
    // If amount is already a string with decimal, return it
    if (typeof amount === 'string' && amount.includes('.')) {
      return parseFloat(amount).toFixed(2);
    }
    
    // Convert BigNumber to readable format
    return ethers.utils.formatUnits(amount, 18);
  } catch (error) {
    console.error('Error formatting amount:', error);
    return '0.00';
  }
}

// Format amount with currency symbol
export function formatCurrency(amount, currency = 'USDT') {
  return `${amount} ${currency}`;
} 
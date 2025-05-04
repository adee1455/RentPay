const hre = require("hardhat");

async function main() {
  // Get the contract to deploy
  const RentPay = await hre.ethers.getContractFactory("RentPay");
  
  // Set your contract parameters (addresses for USDT, USDC, and App Wallet)
  const usdtAddress = "0xd7e9C75C6C05FdE929cAc19bb887892de78819B7";  // Replace with the actual USDT address on Base
  const usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";  // Replace with the actual USDC address on Base
  const appWallet = "0x47b5FDd82B6469043B8285A20BF0E59980f749d5";    // Replace with your app wallet address

  console.log("Deploying RentPay contract...");
  const rentPay = await RentPay.deploy(usdtAddress, usdcAddress, appWallet);
  
  await rentPay.deployed();
  console.log(`RentPay contract deployed to: ${rentPay.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RentPay is Ownable {

    // Supported stablecoins
    address public usdtAddress;
    address public usdcAddress;

    // Middle wallet (app's wallet to receive crypto)
    address public appWallet;

    // Event to trigger backend offramp process
    event RentPaid(
        address indexed tenant,
        uint256 amount,
        address stablecoin,
        string landlordUPI,
        string landlordBankDetails
    );

    // Constructor to initialize contract addresses
    constructor(address _usdtAddress, address _usdcAddress, address _appWallet) Ownable(msg.sender) {
        usdtAddress = _usdtAddress;
        usdcAddress = _usdcAddress;
        appWallet = _appWallet;
    }

    // Tenant pays rent via stablecoin to the app wallet
    function payRent(
        uint256 amount,
        address stablecoin,
        string memory landlordUPI,
        string memory landlordBankDetails
    ) external {
        require(
            stablecoin == usdtAddress || stablecoin == usdcAddress,
            "Unsupported stablecoin"
        );
        require(amount > 0, "Amount must be greater than zero");
        require(bytes(landlordUPI).length > 0 || bytes(landlordBankDetails).length > 0, "Landlord payment details required");

        // Transfer stablecoin from tenant to app wallet
        IERC20 token = IERC20(stablecoin);
        require(
            token.transferFrom(msg.sender, appWallet, amount),
            "Token transfer failed"
        );

        // Emit event for backend to listen and trigger Onmeta offramp
        emit RentPaid(msg.sender, amount, stablecoin, landlordUPI, landlordBankDetails);
    }

    // Admin function to update app wallet
    function setAppWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet address");
        appWallet = newWallet;
    }

    // Admin function to update stablecoin addresses if needed
    function setStablecoinAddresses(address _usdtAddress, address _usdcAddress) external onlyOwner {
        usdtAddress = _usdtAddress;
        usdcAddress = _usdcAddress;
    }
}

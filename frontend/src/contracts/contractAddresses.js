// frontend/src/contracts/contractAddresses.js

// UPDATE THESE WITH YOUR DEPLOYED CONTRACT ADDRESSES!
// Check your deployment output or deployment-addresses.json file

export const CONTRACT_ADDRESSES = {
  roulette: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  rummy: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  cricketBetting: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
};

// Network Configuration
export const NETWORK_CONFIG = {
  chainId: 31337, // Hardhat local network
  chainName: "Hardhat Local",
  rpcUrl: "http://127.0.0.1:8545",
  blockExplorer: "" // No block explorer for local network
};

// You can also export testnet/mainnet configs
export const TESTNET_CONFIG = {
  chainId: 80001, // Mumbai Polygon Testnet
  chainName: "Mumbai Testnet",
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
  blockExplorer: "https://mumbai.polygonscan.com"
};

export const MAINNET_CONFIG = {
  chainId: 137, // Polygon Mainnet
  chainName: "Polygon Mainnet",
  rpcUrl: "https://polygon-rpc.com",
  blockExplorer: "https://polygonscan.com"
};
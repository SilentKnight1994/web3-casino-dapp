# 🎰 Web3 Casino dApp

A decentralized casino built on Ethereum featuring Roulette, 4-Player Rummy, and Cricket Betting. Built with Solidity smart contracts and React frontend.

> **Note:** This is an educational project created to demonstrate how dApps work. It's built for fun and learning purposes. I'm currently working on a fully functional production-ready version!

## 🎮 Features

- **🎲 Roulette:** Bet on numbers, colors, even/odd with real-time spinning animation
- **🃏 Rummy:** 4-player lobby system with prize pools and automatic payouts
- **🏏 Cricket Betting:** Multi-match betting with dynamic odds and pool-based rewards

## 🛠 Tech Stack

**Smart Contracts:** Solidity ^0.8.19, Hardhat, Ethers.js  
**Frontend:** React, Tailwind CSS, Lucide Icons  
**Network:** Ethereum/Polygon compatible

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MetaMask browser extension
- Git

### 1. Clone Repository
```bash
git clone https://github.com/SilentKnight1994/web3-casino-dapp.git
cd web3-casino-dapp
```

### 2. Install Dependencies
```bash
npm install
cd frontend
npm install
cd ..
```

### 3. Start Local Blockchain
```bash
npx hardhat node
```
Leave this terminal running. Copy one of the private keys shown.

### 4. Deploy Contracts
Open a new terminal:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
Copy the three contract addresses from the output.

### 5. Update Contract Addresses
Edit `frontend/src/utils/web3.js` and paste your addresses:
```javascript
const ROULETTE_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const RUMMY_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const CRICKET_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
```

### 6. Configure MetaMask
Add Local Network:
- **Network Name:** Hardhat Local
- **RPC URL:** `http://127.0.0.1:8545`
- **Chain ID:** `31337`
- **Currency:** ETH

Import the private key you copied in Step 3.

### 7. Start Frontend
```bash
cd frontend
npm start
```
Open `http://localhost:3000` and connect your wallet!

## 🎯 How It Works

1. Connect MetaMask wallet
2. Choose a game (Roulette/Rummy/Cricket)
3. Place your bet with ETH
4. Smart contract processes the transaction
5. Win and receive automatic payouts!

## 📁 Project Structure

```
web3-casino-dapp/
├── contracts/          # Solidity smart contracts
├── scripts/           # Deployment scripts
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # Game components
│   │   ├── utils/         # Web3 utilities
│   │   └── contracts/     # Contract ABIs
└── hardhat.config.js  # Hardhat configuration
```

## 🔐 Smart Contracts

- **Roulette.sol:** Handles betting, spinning, and payouts (35:1 for numbers, 2:1 for colors)
- **Rummy.sol:** Manages 4-player games with 0.01 ETH entry fee
- **CricketBetting.sol:** Pool-based betting on cricket matches

## 💡 What I Learned

- Writing secure Solidity smart contracts
- Integrating Web3 with React using Ethers.js
- Managing blockchain state and events
- Building responsive dApp interfaces
- Deploying and testing on local networks

## 📝 License

MIT License - Feel free to use this for learning!

## 🤝 Connect

Building cool Web3 projects! Check out my other work:
- GitHub: [@SilentKnight1994](https://github.com/SilentKnight1994)
- LinkedIn: https://www.linkedin.com/in/somkant-chandrakar-331b271a4/

---

⭐ **Star this repo if you found it helpful!**

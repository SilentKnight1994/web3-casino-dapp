// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...\n");
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying contracts with account:", deployer.address);
  
  // ✅ FIXED: Get balance using provider
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");
  
  // Deploy Roulette Contract
  console.log("🎰 Deploying Roulette Contract...");
  const Roulette = await hre.ethers.getContractFactory("Roulette");
  const roulette = await Roulette.deploy();
  await roulette.waitForDeployment();
  const rouletteAddress = await roulette.getAddress();
  console.log("✅ Roulette deployed to:", rouletteAddress);
  
  // Fund Roulette contract with 10 ETH for payouts
  console.log("💵 Funding Roulette contract with 10 ETH...");
  const fundTx = await roulette.fundContract({ 
    value: hre.ethers.parseEther("10") 
  });
  await fundTx.wait();
  console.log("✅ Roulette funded successfully\n");
  
  // Deploy Rummy Contract
  console.log("🃏 Deploying Rummy Contract...");
  const Rummy = await hre.ethers.getContractFactory("Rummy");
  const rummy = await Rummy.deploy();
  await rummy.waitForDeployment();
  const rummyAddress = await rummy.getAddress();
  console.log("✅ Rummy deployed to:", rummyAddress, "\n");
  
  // Deploy Cricket Betting Contract
  console.log("🏏 Deploying Cricket Betting Contract...");
  const CricketBetting = await hre.ethers.getContractFactory("CricketBetting");
  const cricketBetting = await CricketBetting.deploy();
  await cricketBetting.waitForDeployment();
  const cricketAddress = await cricketBetting.getAddress();
  console.log("✅ CricketBetting deployed to:", cricketAddress, "\n");
  
  // Create some test matches for Cricket Betting
  console.log("📝 Creating test cricket matches...");
  const currentTime = Math.floor(Date.now() / 1000);
  
  const match1 = await cricketBetting.createMatch(
    "India",
    "Australia",
    currentTime + 3600 // Starts in 1 hour
  );
  await match1.wait();
  console.log("✅ Created match: India vs Australia");
  
  const match2 = await cricketBetting.createMatch(
    "England",
    "Pakistan",
    currentTime + 7200 // Starts in 2 hours
  );
  await match2.wait();
  console.log("✅ Created match: England vs Pakistan\n");
  
  // Print deployment summary
  console.log("=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Roulette Contract:       ", rouletteAddress);
  console.log("Rummy Contract:          ", rummyAddress);
  console.log("CricketBetting Contract: ", cricketAddress);
  console.log("=".repeat(60));
  console.log("\n✨ All contracts deployed successfully!");
  console.log("\n📝 SAVE THESE ADDRESSES - You'll need them for the frontend!\n");
  
  // Save deployment info to a file
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    roulette: rouletteAddress,
    rummy: rummyAddress,
    cricketBetting: cricketAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    'deployment-addresses.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment addresses saved to: deployment-addresses.json\n");
  
  // Print instructions
  console.log("📌 NEXT STEPS:");
  console.log("1. Copy these addresses to your frontend/src/utils/web3.js");
  console.log("2. Configure MetaMask with Localhost 8545 network (Chain ID: 31337)");
  console.log("3. Import test account using private key from Hardhat node");
  console.log("4. Start frontend: cd frontend && npm start\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
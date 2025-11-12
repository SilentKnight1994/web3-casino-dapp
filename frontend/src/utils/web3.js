// frontend/src/utils/web3.js
import { ethers } from 'ethers';

// Import contract ABIs FIRST
import RouletteABI from '../contracts/Roulette.json';
import RummyABI from '../contracts/Rummy.json';
import CricketBettingABI from '../contracts/CricketBetting.json';

// 🎯 YOUR DEPLOYED CONTRACT ADDRESSES
const ROULETTE_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const RUMMY_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const CRICKET_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

export const connectWallet = async () => {
  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      throw new Error("Please install MetaMask!");
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock MetaMask.");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const balance = await provider.getBalance(accounts[0]);
    console.log("Balance From Connect:",balance);
    return {
      account: accounts[0],
      provider,
      signer,
      balance: ethers.formatEther(balance)
    };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    
    // Better error messages
    if (error.code === 4001) {
      throw new Error("Connection rejected. Please approve the connection in MetaMask.");
    } else if (error.code === -32002) {
      throw new Error("Connection request pending. Please check MetaMask.");
    }
    
    throw error;
  }
};

export const getContracts = (signer) => {
  const roulette = new ethers.Contract(
    ROULETTE_ADDRESS,
    RouletteABI.abi,
    signer
  );

  const rummy = new ethers.Contract(
    RUMMY_ADDRESS,
    RummyABI.abi,
    signer
  );

  const cricket = new ethers.Contract(
    CRICKET_ADDRESS,
    CricketBettingABI.abi,
    signer
  );

  return { roulette, rummy, cricket };
};

export const getBalance = async (provider, address) => {
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Error getting balance:", error);
    return "0";
  }
};

// Helper functions for ethers
export const parseEther = (value) => ethers.parseEther(value.toString());
export const formatEther = (value) => ethers.formatEther(value);

// Roulette Functions
export const placeBet = async (contract, betType, value, amount) => {
  try {
    const tx = await contract.placeBet(betType, value, {
      value: ethers.parseEther(amount.toString())
    });
    const receipt = await tx.wait();
    
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === "BetPlaced";
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      return parsed.args.betId.toString();
    }
    
    return null;
  } catch (error) {
    console.error("Error placing bet:", error);
    throw error;
  }
};

export const spinRoulette = async (contract, betId, randomNumber) => {
  try {
    const tx = await contract.spin(betId, randomNumber);
    const receipt = await tx.wait();
    
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === "BetSettled";
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      return {
        won: parsed.args.won,
        payout: ethers.formatEther(parsed.args.payout),
        winningNumber: parsed.args.winningNumber.toString()
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error spinning roulette:", error);
    throw error;
  }
};

// Rummy Functions
export const createRummyGame = async (contract) => {
  try {
    const tx = await contract.createGame({
      value: ethers.parseEther("0.01")
    });
    const receipt = await tx.wait();
    
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === "GameCreated";
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      return parsed.args.gameId.toString();
    }
    
    return null;
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
};

export const joinRummyGame = async (contract, gameId) => {
  try {
    const tx = await contract.joinGame(gameId, {
      value: ethers.parseEther("0.01")
    });
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error joining game:", error);
    throw error;
  }
};

export const getRummyGame = async (contract, gameId) => {
  try {
    const game = await contract.getGame(gameId);
    return {
      id: game.id.toString(),
      players: game.players,
      prizePool: ethers.formatEther(game.prizePool),
      state: game.state,
      winner: game.winner
    };
  } catch (error) {
    console.error("Error getting game:", error);
    throw error;
  }
};

// Cricket Betting Functions
export const placeCricketBet = async (contract, matchId, choice, amount) => {
  try {
    const tx = await contract.placeBet(matchId, choice, {
      value: ethers.parseEther(amount.toString())
    });
    const receipt = await tx.wait();
    
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === "BetPlaced";
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      return parsed.args.betId.toString();
    }
    
    return null;
  } catch (error) {
    console.error("Error placing cricket bet:", error);
    throw error;
  }
};

export const getCricketMatch = async (contract, matchId) => {
  try {
    const match = await contract.getMatch(matchId);
    return {
      id: match.id.toString(),
      teamA: match.teamA,
      teamB: match.teamB,
      startTime: match.startTime.toString(),
      status: match.status,
      result: match.result,
      totalPoolTeamA: ethers.formatEther(match.totalPoolTeamA),
      totalPoolTeamB: ethers.formatEther(match.totalPoolTeamB),
      totalPoolDraw: ethers.formatEther(match.totalPoolDraw),
      totalPool: ethers.formatEther(match.totalPool)
    };
  } catch (error) {
    console.error("Error getting match:", error);
    throw error;
  }
};
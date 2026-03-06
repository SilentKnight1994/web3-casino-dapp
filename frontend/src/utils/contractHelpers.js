// frontend/src/utils/contractHelpers.js

import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/contractAddresses';
import RouletteABI from '../contracts/Roulette.json';
import RummyABI from '../contracts/Rummy.json';
import CricketBettingABI from '../contracts/CricketBetting.json';

// Get contract instance
export const getRouletteContract = (provider) => {
  const signer = provider.getSigner();
  return new ethers.Contract(
    CONTRACT_ADDRESSES.roulette,
    RouletteABI.abi,
    signer
  );
};

export const getRummyContract = (provider) => {
  const signer = provider.getSigner();
  return new ethers.Contract(
    CONTRACT_ADDRESSES.rummy,
    RummyABI.abi,
    signer
  );
};

export const getCricketBettingContract = (provider) => {
  const signer = provider.getSigner();
  return new ethers.Contract(
    CONTRACT_ADDRESSES.cricketBetting,
    CricketBettingABI.abi,
    signer
  );
};

// ========================================
// ROULETTE FUNCTIONS
// ========================================

export const placeRouletteBet = async (provider, betType, value, amount) => {
  try {
    const contract = getRouletteContract(provider);
    
    // Convert bet type to enum (0 = Number, 1 = Color, 2 = EvenOdd, etc.)
    let betTypeEnum;
    switch(betType) {
      case 'number':
        betTypeEnum = 0;
        break;
      case 'color':
        betTypeEnum = 1;
        break;
      case 'evenodd':
        betTypeEnum = 2;
        break;
      default:
        betTypeEnum = 0;
    }
    
    // Convert value based on bet type
    let betValue;
    if (betType === 'color') {
      betValue = value === 'red' ? 0 : 1; // 0 = red, 1 = black
    } else if (betType === 'evenodd') {
      betValue = value === 'even' ? 0 : 1; // 0 = even, 1 = odd
    } else {
      betValue = parseInt(value); // for number bets
    }
    
    const tx = await contract.placeBet(betTypeEnum, betValue, {
      value: ethers.parseEther(amount.toString())
    });
    
    const receipt = await tx.wait();
    console.log('Bet placed! Transaction:', receipt);
    
    // Extract betId from event
    const betEvent = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'BetPlaced';
      } catch {
        return false;
      }
    });
    
    if (betEvent) {
      const parsed = contract.interface.parseLog(betEvent);
      return {
        success: true,
        betId: parsed.args.betId.toString(),
        txHash: receipt.hash
      };
    }
    
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('Error placing bet:', error);
    return { success: false, error: error.message };
  }
};

export const spinRoulette = async (provider, betId) => {
  try {
    const contract = getRouletteContract(provider);
    
    // Generate random number (in production, use Chainlink VRF!)
    const randomNumber = Math.floor(Math.random() * 10000);
    
    const tx = await contract.spin(betId, randomNumber);
    const receipt = await tx.wait();
    
    console.log('Spin complete! Transaction:', receipt);
    
    // Extract result from event
    const resultEvent = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'SpinResult';
      } catch {
        return false;
      }
    });
    
    if (resultEvent) {
      const parsed = contract.interface.parseLog(resultEvent);
      const result = parsed.args.result.toString();
      const payout = ethers.formatEther(parsed.args.payout);
      
      return {
        success: true,
        result: parseInt(result),
        payout: payout,
        txHash: receipt.hash
      };
    }
    
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('Error spinning:', error);
    return { success: false, error: error.message };
  }
};

// ========================================
// RUMMY FUNCTIONS
// ========================================

export const createRummyGame = async (provider) => {
  try {
    const contract = getRummyContract(provider);
    
    // Entry fee is 0.01 ETH
    const tx = await contract.createGame({
      value: ethers.parseEther("0.01")
    });
    
    const receipt = await tx.wait();
    console.log('Game created! Transaction:', receipt);
    
    // Extract gameId from event
    const gameEvent = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'GameCreated';
      } catch {
        return false;
      }
    });
    
    if (gameEvent) {
      const parsed = contract.interface.parseLog(gameEvent);
      return {
        success: true,
        gameId: parsed.args.gameId.toString(),
        txHash: receipt.hash
      };
    }
    
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('Error creating game:', error);
    return { success: false, error: error.message };
  }
};

export const joinRummyGame = async (provider, gameId) => {
  try {
    const contract = getRummyContract(provider);
    
    const tx = await contract.joinGame(gameId, {
      value: ethers.parseEther("0.01")
    });
    
    const receipt = await tx.wait();
    console.log('Joined game! Transaction:', receipt);
    
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('Error joining game:', error);
    return { success: false, error: error.message };
  }
};

export const getRummyGames = async (provider) => {
  try {
    const contract = getRummyContract(provider);
    const gameCount = await contract.gameCounter();
    
    const games = [];
    for (let i = 0; i < gameCount; i++) {
      const game = await contract.getGame(i);
      games.push({
        id: i,
        players: game.playerCount.toString(),
        prizePool: ethers.formatEther(game.prizePool),
        status: ['Waiting', 'Playing', 'Finished'][game.status]
      });
    }
    
    return games;
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
};

// ========================================
// CRICKET BETTING FUNCTIONS
// ========================================

export const placeCricketBet = async (provider, matchId, choice, amount) => {
  try {
    const contract = getCricketBettingContract(provider);
    
    // Convert choice to enum (0 = TeamA, 1 = TeamB, 2 = Draw)
    let choiceEnum;
    switch(choice) {
      case 'TeamA':
        choiceEnum = 0;
        break;
      case 'TeamB':
        choiceEnum = 1;
        break;
      case 'Draw':
        choiceEnum = 2;
        break;
      default:
        choiceEnum = 0;
    }
    
    const tx = await contract.placeBet(matchId, choiceEnum, {
      value: ethers.parseEther(amount.toString())
    });
    
    const receipt = await tx.wait();
    console.log('Bet placed! Transaction:', receipt);
    
    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error('Error placing cricket bet:', error);
    return { success: false, error: error.message };
  }
};

export const getCricketMatches = async (provider) => {
  try {
    const contract = getCricketBettingContract(provider);
    const matchCount = await contract.matchCounter();
    
    const matches = [];
    for (let i = 0; i < matchCount; i++) {
      const match = await contract.getMatch(i);
      matches.push({
        id: i,
        teamA: match.teamA,
        teamB: match.teamB,
        poolA: ethers.formatEther(match.totalPoolTeamA),
        poolB: ethers.formatEther(match.totalPoolTeamB),
        poolDraw: ethers.formatEther(match.totalPoolDraw),
        status: ['Open', 'Locked', 'Finished'][match.status]
      });
    }
    
    return matches;
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

export const checkNetwork = async (provider) => {
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);
  
  if (chainId !== 31337) {
    return {
      correct: false,
      message: `Please switch to Hardhat Local network (Chain ID: 31337). Current: ${chainId}`
    };
  }
  
  return { correct: true };
};

export const formatError = (error) => {
  if (error.code === 'ACTION_REJECTED') {
    return 'Transaction rejected by user';
  }
  if (error.message.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  if (error.message.includes('user rejected')) {
    return 'Transaction rejected by user';
  }
  return error.message || 'An error occurred';
};
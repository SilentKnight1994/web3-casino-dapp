import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, Coins, Dices, Users, TrendingUp, Trophy, DollarSign, Play, Lock, Check } from 'lucide-react';

const CasinoDApp = () => {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [activeTab, setActiveTab] = useState('roulette');
  const [web3Available, setWeb3Available] = useState(false);
  const [provider, setProvider] = useState(null);

  // Roulette State
  const [rouletteBet, setRouletteBet] = useState('');
  const [rouletteBetType, setRouletteBetType] = useState('number');
  const [rouletteValue, setRouletteValue] = useState('0');
  const [rouletteSpinning, setRouletteSpinning] = useState(false);
  const [rouletteResult, setRouletteResult] = useState(null);

  // Rummy State
  const [rummyGames, setRummyGames] = useState([
    { id: 0, players: 1, prizePool: '0.01', status: 'Waiting' },
    { id: 1, players: 3, prizePool: '0.03', status: 'Waiting' },
    { id: 2, players: 4, prizePool: '0.04', status: 'Playing' },
  ]);
  const [playerInGame, setPlayerInGame] = useState(false);

  // Cricket State
  const [cricketMatches, setCricketMatches] = useState([
    { id: 0, teamA: 'India', teamB: 'Australia', poolA: '0.5', poolB: '0.3', poolDraw: '0.1', status: 'Open' },
    { id: 1, teamA: 'England', teamB: 'Pakistan', poolA: '0.2', poolB: '0.4', poolDraw: '0.05', status: 'Open' },
  ]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [betChoice, setBetChoice] = useState('TeamA');
  const [betAmount, setBetAmount] = useState('');

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      setWeb3Available(true);
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create provider
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);
        
        // Get signer
        const signer = await web3Provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        
        // Get balance - FIXED VERSION
        const balanceWei = await web3Provider.getBalance(address);
        const balanceEth = ethers.formatEther(balanceWei);
        setBalance(parseFloat(balanceEth).toFixed(4));
        
        console.log('Connected:', address);
        console.log('Balance:', balanceEth, 'ETH');
      } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Error connecting wallet: ' + error.message);
      }
    } else {
      alert('MetaMask not detected! Please install MetaMask to use this dApp.');
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          updateBalance(accounts[0]);
        } else {
          setAccount('');
          setBalance('0');
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const updateBalance = async (address) => {
    if (provider && address) {
      try {
        const balanceWei = await provider.getBalance(address);
        const balanceEth = ethers.formatEther(balanceWei);
        setBalance(parseFloat(balanceEth).toFixed(4));
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    }
  };

  const spinRoulette = () => {
    if (!account) {
      alert('Please connect your wallet first!');
      return;
    }
    if (!rouletteBet || parseFloat(rouletteBet) < 0.001) {
      alert('Minimum bet is 0.001 ETH');
      return;
    }

    setRouletteSpinning(true);
    setRouletteResult(null);

    setTimeout(() => {
      const result = Math.floor(Math.random() * 37);
      const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
      const isRed = redNumbers.includes(result);
      
      let won = false;
      let payout = 0;

      if (rouletteBetType === 'number' && parseInt(rouletteValue) === result) {
        won = true;
        payout = parseFloat(rouletteBet) * 35;
      } else if (rouletteBetType === 'color') {
        if ((rouletteValue === 'red' && isRed) || (rouletteValue === 'black' && !isRed && result !== 0)) {
          won = true;
          payout = parseFloat(rouletteBet) * 2;
        }
      } else if (rouletteBetType === 'evenodd' && result !== 0) {
        if ((rouletteValue === 'even' && result % 2 === 0) || (rouletteValue === 'odd' && result % 2 === 1)) {
          won = true;
          payout = parseFloat(rouletteBet) * 2;
        }
      }

      setRouletteResult({
        number: result,
        color: result === 0 ? 'green' : (isRed ? 'red' : 'black'),
        won: won,
        payout: payout.toFixed(4)
      });
      setRouletteSpinning(false);
    }, 3000);
  };

  const createRummyGame = () => {
    if (!account) {
      alert('Please connect your wallet first!');
      return;
    }
    const newGame = {
      id: rummyGames.length,
      players: 1,
      prizePool: '0.01',
      status: 'Waiting'
    };
    setRummyGames([...rummyGames, newGame]);
    setPlayerInGame(true);
    alert('Game created! Waiting for other players...');
  };

  const joinRummyGame = (gameId) => {
    if (!account) {
      alert('Please connect your wallet first!');
      return;
    }
    if (playerInGame) {
      alert('You are already in a game!');
      return;
    }

    const updatedGames = rummyGames.map(game => {
      if (game.id === gameId && game.players < 4) {
        const newPlayers = game.players + 1;
        return {
          ...game,
          players: newPlayers,
          prizePool: (parseFloat(game.prizePool) + 0.01).toFixed(2),
          status: newPlayers === 4 ? 'Playing' : 'Waiting'
        };
      }
      return game;
    });

    setRummyGames(updatedGames);
    setPlayerInGame(true);
    alert('Joined game successfully!');
  };

  const placeCricketBet = () => {
    if (!account) {
      alert('Please connect your wallet first!');
      return;
    }
    if (!selectedMatch || !betAmount || parseFloat(betAmount) <= 0) {
      alert('Please select a match and enter a valid bet amount!');
      return;
    }

    const updatedMatches = cricketMatches.map(match => {
      if (match.id === selectedMatch) {
        const newMatch = { ...match };
        if (betChoice === 'TeamA') {
          newMatch.poolA = (parseFloat(newMatch.poolA) + parseFloat(betAmount)).toFixed(2);
        } else if (betChoice === 'TeamB') {
          newMatch.poolB = (parseFloat(newMatch.poolB) + parseFloat(betAmount)).toFixed(2);
        } else {
          newMatch.poolDraw = (parseFloat(newMatch.poolDraw) + parseFloat(betAmount)).toFixed(2);
        }
        return newMatch;
      }
      return match;
    });

    setCricketMatches(updatedMatches);
    alert(`Bet placed: ${betAmount} ETH on ${betChoice}`);
    setBetAmount('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <header className="bg-black/40 backdrop-blur-lg border-b border-purple-500/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Dices className="w-8 h-8 text-purple-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Web3 Casino
              </h1>
            </div>
            
            {account ? (
              <div className="flex items-center space-x-4">
                <div className="bg-purple-500/20 px-4 py-2 rounded-lg border border-purple-500/30">
                  <p className="text-sm text-purple-300">Balance</p>
                  <p className="font-bold">{balance} ETH</p>
                </div>
                <div className="bg-blue-500/20 px-4 py-2 rounded-lg border border-blue-500/30">
                  <p className="text-sm text-blue-300">Wallet</p>
                  <p className="font-mono text-xs">{account.slice(0,6)}...{account.slice(-4)}</p>
                </div>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all shadow-lg hover:shadow-purple-500/50"
              >
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex space-x-2 bg-black/40 backdrop-blur-lg p-2 rounded-xl border border-purple-500/30">
          <button
            onClick={() => setActiveTab('roulette')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'roulette' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg' 
                : 'hover:bg-white/10'
            }`}
          >
            <Dices className="w-5 h-5" />
            <span>Roulette</span>
          </button>
          <button
            onClick={() => setActiveTab('rummy')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'rummy' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg' 
                : 'hover:bg-white/10'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Rummy (4P)</span>
          </button>
          <button
            onClick={() => setActiveTab('cricket')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'cricket' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg' 
                : 'hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Cricket Betting</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {activeTab === 'roulette' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
              <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">
                🎰 Roulette Wheel
              </h2>

              <div className="mb-8 flex justify-center">
                <div className={`w-64 h-64 rounded-full bg-gradient-to-br from-yellow-600 to-red-600 flex items-center justify-center shadow-2xl border-8 border-yellow-400 ${rouletteSpinning ? 'animate-spin' : ''}`}>
                  <div className="w-48 h-48 rounded-full bg-black flex items-center justify-center">
                    {rouletteResult && !rouletteSpinning && (
                      <div className="text-center">
                        <div className={`text-6xl font-bold ${rouletteResult.color === 'red' ? 'text-red-500' : rouletteResult.color === 'black' ? 'text-white' : 'text-green-500'}`}>
                          {rouletteResult.number}
                        </div>
                        <div className="text-sm mt-2 text-yellow-400">
                          {rouletteResult.color.toUpperCase()}
                        </div>
                      </div>
                    )}
                    {!rouletteResult && (
                      <Dices className="w-24 h-24 text-yellow-400" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">Bet Type</label>
                  <select 
                    value={rouletteBetType}
                    onChange={(e) => setRouletteBetType(e.target.value)}
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                  >
                    <option value="number">Single Number (35:1)</option>
                    <option value="color">Red/Black (2:1)</option>
                    <option value="evenodd">Even/Odd (2:1)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">
                    {rouletteBetType === 'number' ? 'Number (0-36)' : 'Choice'}
                  </label>
                  {rouletteBetType === 'number' ? (
                    <input
                      type="number"
                      min="0"
                      max="36"
                      value={rouletteValue}
                      onChange={(e) => setRouletteValue(e.target.value)}
                      className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                    />
                  ) : rouletteBetType === 'color' ? (
                    <select 
                      value={rouletteValue}
                      onChange={(e) => setRouletteValue(e.target.value)}
                      className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                    >
                      <option value="red">Red</option>
                      <option value="black">Black</option>
                    </select>
                  ) : (
                    <select 
                      value={rouletteValue}
                      onChange={(e) => setRouletteValue(e.target.value)}
                      className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                    >
                      <option value="even">Even</option>
                      <option value="odd">Odd</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-purple-300">Bet Amount (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={rouletteBet}
                    onChange={(e) => setRouletteBet(e.target.value)}
                    placeholder="Min: 0.001 ETH"
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={spinRoulette}
                    disabled={rouletteSpinning}
                    className="w-full bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-400 hover:to-red-400 disabled:from-gray-500 disabled:to-gray-600 py-3 rounded-lg font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Play className="w-6 h-6" />
                    <span>{rouletteSpinning ? 'SPINNING...' : 'SPIN'}</span>
                  </button>
                </div>
              </div>

              {rouletteResult && !rouletteSpinning && (
                <div className={`p-6 rounded-xl text-center ${rouletteResult.won ? 'bg-green-500/20 border-2 border-green-500' : 'bg-red-500/20 border-2 border-red-500'}`}>
                  <h3 className="text-2xl font-bold mb-2">
                    {rouletteResult.won ? '🎉 YOU WON!' : '😢 YOU LOST'}
                  </h3>
                  {rouletteResult.won && (
                    <p className="text-xl">Payout: <span className="font-bold text-yellow-400">{rouletteResult.payout} ETH</span></p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rummy' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
              <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                🃏 Rummy - 4 Player Game
              </h2>

              <div className="mb-6 flex justify-between items-center">
                <p className="text-purple-300">Entry Fee: <span className="font-bold text-white">0.01 ETH</span></p>
                <button
                  onClick={createRummyGame}
                  disabled={playerInGame}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg flex items-center space-x-2"
                >
                  <Coins className="w-5 h-5" />
                  <span>Create New Game</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rummyGames.map(game => (
                  <div key={game.id} className="bg-purple-900/30 border border-purple-500/50 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">Game #{game.id}</h3>
                        <p className="text-sm text-purple-300">{game.status}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        game.status === 'Waiting' ? 'bg-yellow-500/20 text-yellow-400' :
                        game.status === 'Playing' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {game.status}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300 flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Players
                        </span>
                        <span className="font-bold">{game.players}/4</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-purple-300 flex items-center">
                          <Trophy className="w-4 h-4 mr-2" />
                          Prize Pool
                        </span>
                        <span className="font-bold text-yellow-400">{game.prizePool} ETH</span>
                      </div>

                      {game.status === 'Waiting' && game.players < 4 && (
                        <button
                          onClick={() => joinRummyGame(game.id)}
                          disabled={playerInGame}
                          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 py-2 rounded-lg font-semibold transition-all mt-4"
                        >
                          Join Game
                        </button>
                      )}

                      {game.status === 'Playing' && (
                        <div className="bg-green-500/20 border border-green-500 rounded-lg p-2 text-center text-green-400 text-sm mt-4">
                          Game in Progress
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cricket' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
              <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                🏏 Cricket Match Betting
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-4 text-white">Available Matches</h3>
                  {cricketMatches.map(match => (
                    <div 
                      key={match.id}
                      onClick={() => setSelectedMatch(match.id)}
                      className={`bg-purple-900/30 border rounded-xl p-6 cursor-pointer transition-all ${
                        selectedMatch === match.id 
                          ? 'border-orange-500 shadow-lg shadow-orange-500/50' 
                          : 'border-purple-500/50 hover:border-purple-400'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-bold text-white">{match.teamA} vs {match.teamB}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          match.status === 'Open' ? 'bg-green-500/20 text-green-400' :
                          match.status === 'Locked' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {match.status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-300">{match.teamA} Pool:</span>
                          <span className="font-bold text-blue-400">{match.poolA} ETH</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-300">{match.teamB} Pool:</span>
                          <span className="font-bold text-pink-400">{match.poolB} ETH</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-300">Draw Pool:</span>
                          <span className="font-bold text-yellow-400">{match.poolDraw} ETH</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 text-white">Place Your Bet</h3>
                  <div className="bg-purple-900/30 border border-purple-500/50 rounded-xl p-6">
                    {selectedMatch !== null ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-purple-300">Selected Match</label>
                          <div className="bg-black/40 rounded-lg p-4 border border-purple-500/30">
                            <p className="font-bold text-white">
                              {cricketMatches[selectedMatch].teamA} vs {cricketMatches[selectedMatch].teamB}
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-purple-300">Bet On</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => setBetChoice('TeamA')}
                              className={`py-3 rounded-lg font-semibold transition-all ${
                                betChoice === 'TeamA' 
                                  ? 'bg-blue-600 shadow-lg' 
                                  : 'bg-blue-900/30 hover:bg-blue-800/50'
                              }`}
                            >
                              Team A
                            </button>
                            <button
                              onClick={() => setBetChoice('TeamB')}
                              className={`py-3 rounded-lg font-semibold transition-all ${
                                betChoice === 'TeamB' 
                                  ? 'bg-pink-600 shadow-lg' 
                                  : 'bg-pink-900/30 hover:bg-pink-800/50'
                              }`}
                            >
                              Team B
                            </button>
                            <button
                              onClick={() => setBetChoice('Draw')}
                              className={`py-3 rounded-lg font-semibold transition-all ${
                                betChoice === 'Draw' 
                                  ? 'bg-yellow-600 shadow-lg' 
                                  : 'bg-yellow-900/30 hover:bg-yellow-800/50'
                              }`}
                            >
                              Draw
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-purple-300">Bet Amount (ETH)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                          />
                        </div>

                        <button
                          onClick={placeCricketBet}
                          className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 py-3 rounded-lg font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2"
                        >
                          <DollarSign className="w-6 h-6" />
                          <span>Place Bet</span>
                        </button>

                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
                          <p className="text-sm text-blue-300">
                            <strong>Payout Formula:</strong> Your share of the total pool proportional to your bet. 5% house fee applies.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-purple-300">
                        <Lock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Select a match to place a bet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-black/40 backdrop-blur-lg border-t border-purple-500/30 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-purple-300">
          <p className="mb-2">🎲 Web3 Casino - Portfolio Project by Skilled Smart Contract Developer</p>
          <p className="text-sm">Built with Solidity, React, and Web3</p>
        </div>
      </footer>
    </div>
  );
};

export default CasinoDApp;
// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, Coins, Dices, Users, TrendingUp, Trophy, DollarSign, Play, Lock, AlertCircle, Loader } from 'lucide-react';
import {
  placeRouletteBet,
  spinRoulette,
  createRummyGame,
  joinRummyGame,
  getRummyGames,
  placeCricketBet,
  getCricketMatches,
  checkNetwork,
  formatError
} from './utils/contractHelpers';

const CasinoDApp = () => {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [activeTab, setActiveTab] = useState('roulette');
  const [web3Available, setWeb3Available] = useState(false);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('');

  // Roulette State
  const [rouletteBet, setRouletteBet] = useState('');
  const [rouletteBetType, setRouletteBetType] = useState('number');
  const [rouletteValue, setRouletteValue] = useState('0');
  const [rouletteSpinning, setRouletteSpinning] = useState(false);
  const [rouletteResult, setRouletteResult] = useState(null);
  const [currentBetId, setCurrentBetId] = useState(null);

  // Rummy State
  const [rummyGames, setRummyGames] = useState([]);
  const [playerInGame, setPlayerInGame] = useState(false);

  // Cricket State
  const [cricketMatches, setCricketMatches] = useState([]);
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
        setLoading(true);
        setTxStatus('Connecting wallet...');
        
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);
        
        const signer = await web3Provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        
        const balanceWei = await web3Provider.getBalance(address);
        const balanceEth = ethers.formatEther(balanceWei);
        setBalance(parseFloat(balanceEth).toFixed(4));
        
        // Check if on correct network
        const networkCheck = await checkNetwork(web3Provider);
        if (!networkCheck.correct) {
          alert(networkCheck.message);
        }
        
        setTxStatus('');
        console.log('Connected:', address);
      } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Error connecting wallet: ' + formatError(error));
        setTxStatus('');
      } finally {
        setLoading(false);
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

  // Load Rummy games on mount
  useEffect(() => {
    if (provider && account) {
      loadRummyGames();
    }
  }, [provider, account]);

  // Load Cricket matches on mount
  useEffect(() => {
    if (provider && account) {
      loadCricketMatches();
    }
  }, [provider, account]);

  const loadRummyGames = async () => {
    try {
      const games = await getRummyGames(provider);
      setRummyGames(games);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const loadCricketMatches = async () => {
    try {
      const matches = await getCricketMatches(provider);
      setCricketMatches(matches);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  // ========================================
  // ROULETTE FUNCTIONS
  // ========================================

  const handlePlaceRouletteBet = async () => {
    if (!account) {
      alert('Please connect your wallet first!');
      return;
    }
    if (!rouletteBet || parseFloat(rouletteBet) < 0.001) {
      alert('Minimum bet is 0.001 ETH');
      return;
    }

    try {
      setLoading(true);
      setTxStatus('Placing bet... Please confirm in MetaMask');

      const result = await placeRouletteBet(
        provider,
        rouletteBetType,
        rouletteValue,
        rouletteBet
      );

      if (result.success) {
        setCurrentBetId(result.betId);
        setTxStatus('Bet placed successfully! Now spinning...');
        await updateBalance(account);
        
        // Automatically spin after bet is placed
        setTimeout(() => handleSpinRoulette(result.betId), 1000);
      } else {
        alert('Error placing bet: ' + result.error);
        setTxStatus('');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + formatError(error));
      setTxStatus('');
      setLoading(false);
    }
  };

  const handleSpinRoulette = async (betId) => {
    try {
      setRouletteSpinning(true);
      setTxStatus('Spinning... Please confirm in MetaMask');

      const result = await spinRoulette(provider, betId);

      if (result.success) {
        const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
        const isRed = redNumbers.includes(result.result);
        
        setRouletteResult({
          number: result.result,
          color: result.result === 0 ? 'green' : (isRed ? 'red' : 'black'),
          won: parseFloat(result.payout) > 0,
          payout: result.payout
        });

        setTxStatus('Spin complete!');
        await updateBalance(account);
      } else {
        alert('Error spinning: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + formatError(error));
    } finally {
      setRouletteSpinning(false);
      setLoading(false);
      setTxStatus('');
    }
  };

  // ========================================
  // RUMMY FUNCTIONS
  // ========================================

  const handleCreateRummyGame = async () => {
    if (!account) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      setLoading(true);
      setTxStatus('Creating game... Please confirm in MetaMask');

      const result = await createRummyGame(provider);

      if (result.success) {
        alert('Game created successfully! Game ID: ' + result.gameId);
        setPlayerInGame(true);
        await loadRummyGames();
        await updateBalance(account);
      } else {
        alert('Error creating game: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + formatError(error));
    } finally {
      setLoading(false);
      setTxStatus('');
    }
  };

  const handleJoinRummyGame = async (gameId) => {
    if (!account) {
      alert('Please connect your wallet first!');
      return;
    }
    if (playerInGame) {
      alert('You are already in a game!');
      return;
    }

    try {
      setLoading(true);
      setTxStatus('Joining game... Please confirm in MetaMask');

      const result = await joinRummyGame(provider, gameId);

      if (result.success) {
        alert('Joined game successfully!');
        setPlayerInGame(true);
        await loadRummyGames();
        await updateBalance(account);
      } else {
        alert('Error joining game: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + formatError(error));
    } finally {
      setLoading(false);
      setTxStatus('');
    }
  };

  // ========================================
  // CRICKET BETTING FUNCTIONS
  // ========================================

  const handlePlaceCricketBet = async () => {
    if (!account) {
      alert('Please connect your wallet first!');
      return;
    }
    if (selectedMatch === null || !betAmount || parseFloat(betAmount) <= 0) {
      alert('Please select a match and enter a valid bet amount!');
      return;
    }

    try {
      setLoading(true);
      setTxStatus('Placing bet... Please confirm in MetaMask');

      const result = await placeCricketBet(provider, selectedMatch, betChoice, betAmount);

      if (result.success) {
        alert(`Bet placed successfully! ${betAmount} ETH on ${betChoice}`);
        setBetAmount('');
        await loadCricketMatches();
        await updateBalance(account);
      } else {
        alert('Error placing bet: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + formatError(error));
    } finally {
      setLoading(false);
      setTxStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-purple-900/90 p-8 rounded-2xl border border-purple-500 flex flex-col items-center space-y-4">
            <Loader className="w-12 h-12 text-purple-400 animate-spin" />
            <p className="text-lg font-semibold">{txStatus || 'Processing...'}</p>
            <p className="text-sm text-purple-300">Please check MetaMask</p>
          </div>
        </div>
      )}

      <header className="bg-black/40 backdrop-blur-lg border-b border-purple-500/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Dices className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Web3 Casino
                </h1>
                <p className="text-xs text-purple-300">Blockchain-Powered Gaming</p>
              </div>
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
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all shadow-lg hover:shadow-purple-500/50"
              >
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {!web3Available && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-red-300">MetaMask not detected! Please install MetaMask to use this dApp.</p>
          </div>
        </div>
      )}

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
                    disabled={loading}
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
                      disabled={loading}
                      className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                    />
                  ) : rouletteBetType === 'color' ? (
                    <select 
                      value={rouletteValue}
                      onChange={(e) => setRouletteValue(e.target.value)}
                      disabled={loading}
                      className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                    >
                      <option value="red">Red</option>
                      <option value="black">Black</option>
                    </select>
                  ) : (
                    <select 
                      value={rouletteValue}
                      onChange={(e) => setRouletteValue(e.target.value)}
                      disabled={loading}
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
                    disabled={loading}
                    placeholder="Min: 0.001 ETH"
                    className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handlePlaceRouletteBet}
                    disabled={loading || rouletteSpinning}
                    className="w-full bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-400 hover:to-red-400 disabled:from-gray-500 disabled:to-gray-600 py-3 rounded-lg font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Play className="w-6 h-6" />
                    <span>{rouletteSpinning ? 'SPINNING...' : loading ? 'PLACING BET...' : 'PLACE BET & SPIN'}</span>
                  </button>
                </div>
              </div>

              {rouletteResult && !rouletteSpinning && (
                <div className={`p-6 rounded-xl text-center ${rouletteResult.won ? 'bg-green-500/20 border-2 border-green-500' : 'bg-red-500/20 border-2 border-red-500'}`}>
                  <h3 className="text-2xl font-bold mb-2">
                    {rouletteResult.won ? '🎉 YOU WON!' : '😢 YOU LOST'}
                  </h3>
                  {rouletteResult.won && parseFloat(rouletteResult.payout) > 0 && (
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
                  onClick={handleCreateRummyGame}
                  disabled={playerInGame || loading}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg flex items-center space-x-2"
                >
                  <Coins className="w-5 h-5" />
                  <span>Create New Game</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rummyGames.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-purple-300">
                    <p>No games available. Create a new game to start playing!</p>
                  </div>
                ) : (
                  rummyGames.map(game => (
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

                        {game.status === 'Waiting' && parseInt(game.players) < 4 && (
                          <button
                            onClick={() => handleJoinRummyGame(game.id)}
                            disabled={playerInGame || loading}
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
                  ))
                )}
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
                  {cricketMatches.length === 0 ? (
                    <div className="text-center py-12 text-purple-300">
                      <p>No matches available at the moment.</p>
                    </div>
                  ) : (
                    cricketMatches.map(match => (
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
                            <span className="text-purple-300">{match.teamB} Pool:</span>
                            <span className="font-bold text-pink-400">{match.poolB} ETH</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-purple-300">Draw Pool:</span>
                            <span className="font-bold text-yellow-400">{match.poolDraw} ETH</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                              {cricketMatches[selectedMatch]?.teamA} vs {cricketMatches[selectedMatch]?.teamB}
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-purple-300">Bet On</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => setBetChoice('TeamA')}
                              disabled={loading}
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
                              disabled={loading}
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
                              disabled={loading}
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
                            disabled={loading}
                            placeholder="Enter amount"
                            className="w-full bg-purple-900/50 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
                          />
                        </div>

                        <button
                          onClick={handlePlaceCricketBet}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 disabled:from-gray-500 disabled:to-gray-600 py-3 rounded-lg font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2"
                        >
                          <DollarSign className="w-6 h-6" />
                          <span>{loading ? 'PLACING BET...' : 'PLACE BET'}</span>
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
          <p className="mb-2">🎲 Web3 Casino - Blockchain-Powered Gaming</p>
          <p className="text-sm">Built with Solidity, React, Hardhat & Ethers.js</p>
          <p className="text-xs mt-2 text-purple-400">
            {account ? `Connected to: ${account}` : 'Not Connected'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CasinoDApp
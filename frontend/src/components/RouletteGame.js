import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { placeBet, spinRoulette } from '../utils/web3';

const RouletteGame = ({ contract, updateBalance }) => {
  const [betAmount, setBetAmount] = useState('0.01');
  const [betType, setBetType] = useState(0);
  const [betValue, setBetValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentBetId, setCurrentBetId] = useState(null);
  const [result, setResult] = useState(null);
  const [randomNumber, setRandomNumber] = useState('');

  const betTypes = [
    { id: 0, name: 'Single Number', desc: '36:1 payout' },
    { id: 1, name: 'Red', desc: '2:1 payout' },
    { id: 2, name: 'Black', desc: '2:1 payout' },
    { id: 3, name: 'Even', desc: '2:1 payout' },
    { id: 4, name: 'Odd', desc: '2:1 payout' },
    { id: 5, name: 'Low (1-18)', desc: '2:1 payout' },
    { id: 6, name: 'High (19-36)', desc: '2:1 payout' }
  ];

  const handlePlaceBet = async () => {
    try {
      setLoading(true);
      setResult(null);
      
      if (!betAmount || parseFloat(betAmount) <= 0) {
        throw new Error('Please enter a valid bet amount');
      }

      if (betType === 0 && (betValue < 0 || betValue > 36)) {
        throw new Error('For single number, choose 0-36');
      }

      const betId = await placeBet(contract, betType, betValue, betAmount);
      setCurrentBetId(betId);
      await updateBalance();
      
      alert(`Bet placed successfully! Bet ID: ${betId}\nNow click SPIN to see result!`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSpin = async () => {
    try {
      if (!currentBetId) {
        throw new Error('Please place a bet first!');
      }

      if (!randomNumber || randomNumber < 0 || randomNumber > 36) {
        throw new Error('Please enter a random number (0-36)');
      }

      setLoading(true);
      
      const spinResult = await spinRoulette(contract, currentBetId, randomNumber);
      setResult(spinResult);
      await updateBalance();
      
      setCurrentBetId(null);
      setRandomNumber('');
      
      if (spinResult.won) {
        alert(`🎉 YOU WON!\nWinning Number: ${spinResult.winningNumber}\nPayout: ${spinResult.payout} ETH`);
      } else {
        alert(`😢 You Lost!\nWinning Number: ${spinResult.winningNumber}\nBetter luck next time!`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">🎰 Roulette</h2>
        <p className="text-purple-300">Place your bet and spin the wheel!</p>
      </div>

      <div className="bg-purple-900 bg-opacity-30 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4">Select Bet Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {betTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setBetType(type.id)}
              className={`p-4 rounded-lg font-semibold transition-all ${
                betType === type.id
                  ? 'bg-purple-600 text-white ring-2 ring-white'
                  : 'bg-purple-800 bg-opacity-50 text-purple-200 hover:bg-purple-700'
              }`}
            >
              <div className="text-sm">{type.name}</div>
              <div className="text-xs mt-1 opacity-75">{type.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-purple-900 bg-opacity-30 rounded-lg p-6">
          <h3 className="text-white font-bold mb-4">Bet Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-purple-300 mb-2 text-sm">Bet Amount (ETH)</label>
              <input
                type="number"
                step="0.01"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-purple-950 text-white border border-purple-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="0.01"
              />
            </div>

            {betType === 0 && (
              <div>
                <label className="block text-purple-300 mb-2 text-sm">
                  Number to bet on (0-36)
                </label>
                <input
                  type="number"
                  min="0"
                  max="36"
                  value={betValue}
                  onChange={(e) => setBetValue(parseInt(e.target.value) || 0)}
                  className="w-full bg-purple-950 text-white border border-purple-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter number 0-36"
                />
              </div>
            )}

            <button
              onClick={handlePlaceBet}
              disabled={loading || currentBetId}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Place Bet</span>
              )}
            </button>
          </div>
        </div>

        <div className="bg-purple-900 bg-opacity-30 rounded-lg p-6">
          <h3 className="text-white font-bold mb-4">Spin Wheel</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-purple-300 mb-2 text-sm">
                Random Number (0-36) *
              </label>
              <input
                type="number"
                min="0"
                max="36"
                value={randomNumber}
                onChange={(e) => setRandomNumber(e.target.value)}
                className="w-full bg-purple-950 text-white border border-purple-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter 0-36"
                disabled={!currentBetId}
              />
              <p className="text-purple-400 text-xs mt-2">
                * In production, this would use Chainlink VRF for randomness
              </p>
            </div>

            <button
              onClick={handleSpin}
              disabled={loading || !currentBetId || !randomNumber}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Spinning...</span>
                </>
              ) : (
                <span>{currentBetId ? 'SPIN!' : 'Place Bet First'}</span>
              )}
            </button>

            {currentBetId && (
              <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-3">
                <p className="text-green-300 text-sm text-center">
                  ✅ Bet Placed! ID: {currentBetId}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {result && (
        <div className={`rounded-lg p-6 text-center ${
          result.won
            ? 'bg-green-900 bg-opacity-30 border-2 border-green-500'
            : 'bg-red-900 bg-opacity-30 border-2 border-red-500'
        }`}>
          <h3 className={`text-2xl font-bold mb-2 ${
            result.won ? 'text-green-300' : 'text-red-300'
          }`}>
            {result.won ? '🎉 YOU WON! 🎉' : '😢 You Lost'}
          </h3>
          <p className="text-white text-xl mb-1">
            Winning Number: <span className="font-bold">{result.winningNumber}</span>
          </p>
          {result.won && (
            <p className="text-green-300 text-lg">
              Payout: <span className="font-bold">{result.payout} ETH</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RouletteGame;
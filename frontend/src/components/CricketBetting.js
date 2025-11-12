import React, { useState, useEffect } from 'react';
import { Loader2, Trophy } from 'lucide-react';
import { placeCricketBet, getCricketMatch } from '../utils/web3';

const CricketBetting = ({ contract, updateBalance }) => {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [betAmount, setBetAmount] = useState('0.01');
  const [selectedTeam, setSelectedTeam] = useState(0);

  useEffect(() => {
    fetchMatches();
  }, [contract]);

  const fetchMatches = async () => {
    try {
      const match1 = await getCricketMatch(contract, 1);
      const match2 = await getCricketMatch(contract, 2);
      setMatches([match1, match2]);
      setSelectedMatch(match1);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handlePlaceBet = async () => {
    try {
      if (!selectedMatch) {
        throw new Error('Please select a match');
      }

      if (!betAmount || parseFloat(betAmount) <= 0) {
        throw new Error('Please enter a valid bet amount');
      }

      setLoading(true);
      
      const betId = await placeCricketBet(
        contract,
        selectedMatch.id,
        selectedTeam,
        betAmount
      );
      
      await updateBalance();
      alert(`Bet placed successfully! Bet ID: ${betId}\nAmount: ${betAmount} ETH`);
      await fetchMatches();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getMatchStatus = (status) => {
    const statuses = ['Open for Betting', 'Locked', 'Finished'];
    return statuses[status] || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">🏏 Cricket Betting</h2>
        <p className="text-purple-300">Bet on your favorite team and win big!</p>
      </div>

      <div className="bg-purple-900 bg-opacity-30 rounded-lg p-6">
        <h3 className="text-white font-bold mb-4 flex items-center space-x-2">
          <Trophy size={20} />
          <span>Available Matches</span>
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {matches.map((match) => (
            <button
              key={match.id}
              onClick={() => setSelectedMatch(match)}
              className={`text-left p-4 rounded-lg transition-all ${
                selectedMatch?.id === match.id
                  ? 'bg-purple-600 ring-2 ring-white'
                  : 'bg-purple-950 hover:bg-purple-800'
              }`}
            >
              <div className="text-white font-bold text-lg">{match.teamA}</div>
              <div className="text-purple-300 text-sm">vs</div>
              <div className="text-white font-bold text-lg">{match.teamB}</div>
              <div className="text-purple-300 text-xs mt-2">
                Pool: {match.totalPool} ETH
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedMatch && selectedMatch.status === 0 && (
        <div className="bg-purple-900 bg-opacity-30 rounded-lg p-6">
          <h3 className="text-white font-bold text-xl mb-4">Place Your Bet</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-purple-300 mb-3 text-sm">Select Team</label>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedTeam(0)}
                  className={`w-full p-4 rounded-lg font-semibold transition-all ${
                    selectedTeam === 0
                      ? 'bg-purple-600 text-white ring-2 ring-white'
                      : 'bg-purple-950 text-purple-200 hover:bg-purple-800'
                  }`}
                >
                  {selectedMatch.teamA} Wins
                </button>
                
                <button
                  onClick={() => setSelectedTeam(1)}
                  className={`w-full p-4 rounded-lg font-semibold transition-all ${
                    selectedTeam === 1
                      ? 'bg-purple-600 text-white ring-2 ring-white'
                      : 'bg-purple-950 text-purple-200 hover:bg-purple-800'
                  }`}
                >
                  {selectedMatch.teamB} Wins
                </button>
                
                <button
                  onClick={() => setSelectedTeam(2)}
                  className={`w-full p-4 rounded-lg font-semibold transition-all ${
                    selectedTeam === 2
                      ? 'bg-purple-600 text-white ring-2 ring-white'
                      : 'bg-purple-950 text-purple-200 hover:bg-purple-800'
                  }`}
                >
                  Draw
                </button>
              </div>
            </div>

            <div>
              <label className="block text-purple-300 mb-3 text-sm">Bet Amount (ETH)</label>
              <input
                type="number"
                step="0.01"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-purple-950 text-white border border-purple-600 rounded-lg px-4 py-3 mb-4"
                placeholder="0.01"
              />

              <button
                onClick={handlePlaceBet}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-lg disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Placing Bet...</span>
                  </>
                ) : (
                  <>
                    <Trophy size={20} />
                    <span>Place Bet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CricketBetting;
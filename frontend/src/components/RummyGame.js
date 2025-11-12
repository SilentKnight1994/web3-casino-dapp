import React, { useState } from 'react';
import { Loader2, Users, Trophy } from 'lucide-react';
import { createRummyGame, joinRummyGame, getRummyGame } from '../utils/web3';

const RummyGame = ({ contract, updateBalance, account }) => {
  const [loading, setLoading] = useState(false);
  const [gameId, setGameId] = useState('');
  const [currentGame, setCurrentGame] = useState(null);
  const [searchGameId, setSearchGameId] = useState('');

  const handleCreateGame = async () => {
    try {
      setLoading(true);
      const newGameId = await createRummyGame(contract);
      await updateBalance();
      
      setGameId(newGameId);
      alert(`Game created successfully! Game ID: ${newGameId}\nEntry fee: 0.01 ETH paid`);
      
      await fetchGameDetails(newGameId);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    try {
      if (!searchGameId) {
        throw new Error('Please enter a Game ID');
      }

      setLoading(true);
      await joinRummyGame(contract, searchGameId);
      await updateBalance();
      
      alert(`Successfully joined game ${searchGameId}!`);
      await fetchGameDetails(searchGameId);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchGameDetails = async (gId) => {
    try {
      const game = await getRummyGame(contract, gId);
      setCurrentGame(game);
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  };

  const getGameState = (state) => {
    const states = ['Waiting for Players', 'In Progress', 'Finished'];
    return states[state] || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">🃏 4-Player Rummy</h2>
        <p className="text-purple-300">Create or join a game to start playing!</p>
        <p className="text-purple-400 text-sm mt-2">Entry Fee: 0.01 ETH per player</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-purple-900 bg-opacity-30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="text-purple-300" size={24} />
            <h3 className="text-white font-bold text-xl">Create New Game</h3>
          </div>
          
          <p className="text-purple-300 mb-6 text-sm">
            Start a new Rummy game. Three more players can join your game.
          </p>

          <button
            onClick={handleCreateGame}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Users size={20} />
                <span>Create Game (0.01 ETH)</span>
              </>
            )}
          </button>

          {gameId && (
            <div className="mt-4 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-4">
              <p className="text-green-300 text-sm mb-2">✅ Game Created!</p>
              <p className="text-white font-bold text-lg">Game ID: {gameId}</p>
              <p className="text-green-300 text-xs mt-2">
                Share this ID with friends to join!
              </p>
            </div>
          )}
        </div>

        <div className="bg-purple-900 bg-opacity-30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="text-purple-300" size={24} />
            <h3 className="text-white font-bold text-xl">Join Game</h3>
          </div>
          
          <p className="text-purple-300 mb-6 text-sm">
            Enter a Game ID to join an existing game.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-purple-300 mb-2 text-sm">Game ID</label>
              <input
                type="number"
                value={searchGameId}
                onChange={(e) => setSearchGameId(e.target.value)}
                className="w-full bg-purple-950 text-white border border-purple-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter Game ID"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleJoinGame}
                disabled={loading || !searchGameId}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Joining...</span>
                  </>
                ) : (
                  <span>Join (0.01 ETH)</span>
                )}
              </button>

              <button
                onClick={() => fetchGameDetails(searchGameId)}
                disabled={!searchGameId}
                className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
              >
                View
              </button>
            </div>
          </div>
        </div>
      </div>

      {currentGame && (
        <div className="bg-purple-900 bg-opacity-30 rounded-lg p-6">
          <h3 className="text-white font-bold text-xl mb-4">Game Details</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-purple-300">Game ID:</span>
                <span className="text-white font-bold">{currentGame.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-purple-300">Status:</span>
                <span className={`font-bold ${
                  currentGame.state === 0 ? 'text-yellow-300' :
                  currentGame.state === 1 ? 'text-green-300' :
                  'text-blue-300'
                }`}>
                  {getGameState(currentGame.state)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-purple-300">Prize Pool:</span>
                <span className="text-white font-bold">{currentGame.prizePool} ETH</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-purple-300">Players:</span>
                <span className="text-white font-bold">
                  {currentGame.players.filter(p => p !== '0x0000000000000000000000000000000000000000').length} / 4
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-purple-300 font-semibold mb-3">Players:</h4>
              <div className="space-y-2">
                {currentGame.players.map((player, index) => {
                  if (player === '0x0000000000000000000000000000000000000000') {
                    return (
                      <div key={index} className="bg-purple-950 border border-purple-700 rounded-lg p-3">
                        <span className="text-purple-400">Slot {index + 1}: Waiting...</span>
                      </div>
                    );
                  }
                  
                  const isCurrentUser = player.toLowerCase() === account.toLowerCase();
                  return (
                    <div key={index} className={`rounded-lg p-3 ${
                      isCurrentUser
                        ? 'bg-green-900 bg-opacity-30 border border-green-500'
                        : 'bg-purple-950 border border-purple-600'
                    }`}>
                      <span className={isCurrentUser ? 'text-green-300' : 'text-white'}>
                        Player {index + 1} {isCurrentUser && '(You)'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RummyGame;
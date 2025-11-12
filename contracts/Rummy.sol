// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Rummy {
    address public owner;
    uint256 public gameCounter;
    uint256 public entryFee = 0.01 ether;
    
    enum GameState { WAITING, PLAYING, FINISHED }
    
    struct Game {
        uint256 id;
        address[4] players;
        uint256 playerCount;
        uint256 prizePool;
        address winner;
        GameState state;
    }
    
    mapping(uint256 => Game) public games;
    
    event GameCreated(uint256 indexed gameId, address indexed creator);
    event PlayerJoined(uint256 indexed gameId, address indexed player);
    event GameStarted(uint256 indexed gameId);
    event WinnerDeclared(uint256 indexed gameId, address indexed winner, uint256 prize);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    function createGame() external payable {
        require(msg.value == entryFee, "Wrong entry fee");
        
        gameCounter++;
        Game storage game = games[gameCounter];
        game.id = gameCounter;
        game.players[0] = msg.sender;
        game.playerCount = 1;
        game.prizePool = msg.value;
        game.state = GameState.WAITING;
        
        emit GameCreated(gameCounter, msg.sender);
    }
    
    function joinGame(uint256 _gameId) external payable {
        require(msg.value == entryFee, "Wrong entry fee");
        Game storage game = games[_gameId];
        require(game.state == GameState.WAITING, "Game not available");
        require(game.playerCount < 4, "Game full");
        
        game.players[game.playerCount] = msg.sender;
        game.playerCount++;
        game.prizePool += msg.value;
        
        emit PlayerJoined(_gameId, msg.sender);
        
        if (game.playerCount == 4) {
            game.state = GameState.PLAYING;
            emit GameStarted(_gameId);
        }
    }
    
    function declareWinner(uint256 _gameId, address _winner) external onlyOwner {
        Game storage game = games[_gameId];
        require(game.state == GameState.PLAYING, "Game not playing");
        
        bool validWinner = false;
        for (uint256 i = 0; i < 4; i++) {
            if (game.players[i] == _winner) {
                validWinner = true;
                break;
            }
        }
        require(validWinner, "Invalid winner");
        
        uint256 prize = (game.prizePool * 90) / 100; // 90% to winner
        game.winner = _winner;
        game.state = GameState.FINISHED;
        
        payable(_winner).transfer(prize);
        
        emit WinnerDeclared(_gameId, _winner, prize);
    }
    
    function getGame(uint256 _gameId) external view returns (
        uint256 id,
        address[4] memory players,
        uint256 playerCount,
        uint256 prizePool,
        address winner,
        GameState state
    ) {
        Game memory game = games[_gameId];
        return (game.id, game.players, game.playerCount, game.prizePool, game.winner, game.state);
    }
    
    receive() external payable {}
}
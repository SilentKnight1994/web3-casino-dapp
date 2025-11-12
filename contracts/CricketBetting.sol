// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CricketBetting {
    address public owner;
    uint256 public matchCounter;
    uint256 public betCounter;
    uint256 public minBet = 0.001 ether;
    
    enum MatchResult { PENDING, TEAM_A, TEAM_B, DRAW }
    enum BetChoice { TEAM_A, TEAM_B, DRAW }
    
    struct Match {
        uint256 id;
        string teamA;
        string teamB;
        uint256 startTime;
        bool locked;
        MatchResult result;
        uint256 poolA;
        uint256 poolB;
        uint256 poolDraw;
    }
    
    struct Bet {
        uint256 matchId;
        address bettor;
        BetChoice choice;
        uint256 amount;
        bool claimed;
    }
    
    mapping(uint256 => Match) public matches;
    mapping(uint256 => Bet) public bets;
    
    event MatchCreated(uint256 indexed matchId, string teamA, string teamB, uint256 startTime);
    event BetPlaced(uint256 indexed betId, uint256 indexed matchId, address indexed bettor, BetChoice choice, uint256 amount);
    event MatchLocked(uint256 indexed matchId);
    event MatchFinished(uint256 indexed matchId, MatchResult result);
    event WinningsClaimed(uint256 indexed betId, address indexed bettor, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    function createMatch(string memory _teamA, string memory _teamB, uint256 _startTime) external onlyOwner {
        matchCounter++;
        matches[matchCounter] = Match({
            id: matchCounter,
            teamA: _teamA,
            teamB: _teamB,
            startTime: _startTime,
            locked: false,
            result: MatchResult.PENDING,
            poolA: 0,
            poolB: 0,
            poolDraw: 0
        });
        
        emit MatchCreated(matchCounter, _teamA, _teamB, _startTime);
    }
    
    function placeBet(uint256 _matchId, BetChoice _choice) external payable {
        require(msg.value >= minBet, "Bet too small");
        Match storage matchData = matches[_matchId];
        require(!matchData.locked, "Betting locked");
        require(matchData.result == MatchResult.PENDING, "Match finished");
        
        betCounter++;
        bets[betCounter] = Bet({
            matchId: _matchId,
            bettor: msg.sender,
            choice: _choice,
            amount: msg.value,
            claimed: false
        });
        
        if (_choice == BetChoice.TEAM_A) {
            matchData.poolA += msg.value;
        } else if (_choice == BetChoice.TEAM_B) {
            matchData.poolB += msg.value;
        } else {
            matchData.poolDraw += msg.value;
        }
        
        emit BetPlaced(betCounter, _matchId, msg.sender, _choice, msg.value);
    }
    
    function lockMatch(uint256 _matchId) external onlyOwner {
        matches[_matchId].locked = true;
        emit MatchLocked(_matchId);
    }
    
    function finishMatch(uint256 _matchId, MatchResult _result) external onlyOwner {
        Match storage matchData = matches[_matchId];
        require(matchData.locked, "Match not locked");
        require(_result != MatchResult.PENDING, "Invalid result");
        
        matchData.result = _result;
        emit MatchFinished(_matchId, _result);
    }
    
    function claimWinnings(uint256 _betId) external {
        Bet storage bet = bets[_betId];
        require(bet.bettor == msg.sender, "Not your bet");
        require(!bet.claimed, "Already claimed");
        
        Match storage matchData = matches[bet.matchId];
        require(matchData.result != MatchResult.PENDING, "Match not finished");
        
        bool won = false;
        uint256 winningPool = 0;
        uint256 totalPool = matchData.poolA + matchData.poolB + matchData.poolDraw;
        
        if (matchData.result == MatchResult.TEAM_A && bet.choice == BetChoice.TEAM_A) {
            won = true;
            winningPool = matchData.poolA;
        } else if (matchData.result == MatchResult.TEAM_B && bet.choice == BetChoice.TEAM_B) {
            won = true;
            winningPool = matchData.poolB;
        } else if (matchData.result == MatchResult.DRAW && bet.choice == BetChoice.DRAW) {
            won = true;
            winningPool = matchData.poolDraw;
        }
        
        require(won, "Bet lost");
        
        uint256 winnings = (bet.amount * totalPool * 95) / (winningPool * 100); // 95% payout, 5% fee
        bet.claimed = true;
        
        payable(msg.sender).transfer(winnings);
        emit WinningsClaimed(_betId, msg.sender, winnings);
    }
    
    receive() external payable {}
}
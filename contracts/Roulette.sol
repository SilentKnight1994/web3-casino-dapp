// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Roulette {
    address public owner;
    uint256 public betCounter;
    uint256 public minBet = 0.001 ether;
    uint256 public maxBet = 1 ether;
    
    enum BetType { NUMBER, COLOR, EVENODD, HIGHLOW }
    
    struct Bet {
        address player;
        uint256 amount;
        BetType betType;
        uint256 value;
        bool settled;
    }
    
    mapping(uint256 => Bet) public bets;
    
    event BetPlaced(uint256 indexed betId, address indexed player, uint256 amount, BetType betType, uint256 value);
    event BetSettled(uint256 indexed betId, address indexed player, uint256 winnings, uint256 result);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    function placeBet(BetType _betType, uint256 _value) external payable {
        require(msg.value >= minBet && msg.value <= maxBet, "Invalid bet amount");
        require(_value <= 36, "Invalid bet value");
        
        betCounter++;
        bets[betCounter] = Bet({
            player: msg.sender,
            amount: msg.value,
            betType: _betType,
            value: _value,
            settled: false
        });
        
        emit BetPlaced(betCounter, msg.sender, msg.value, _betType, _value);
    }
    
    function spin(uint256 _betId, uint256 _result) external onlyOwner {
        require(_result <= 36, "Invalid result");
        Bet storage bet = bets[_betId];
        require(!bet.settled, "Already settled");
        
        uint256 winnings = 0;
        
        if (bet.betType == BetType.NUMBER && bet.value == _result) {
            winnings = bet.amount * 36;
        } else if (bet.betType == BetType.COLOR) {
            if ((bet.value == 0 && isRed(_result)) || (bet.value == 1 && !isRed(_result))) {
                winnings = bet.amount * 2;
            }
        } else if (bet.betType == BetType.EVENODD) {
            if ((bet.value == 0 && _result % 2 == 0) || (bet.value == 1 && _result % 2 == 1)) {
                winnings = bet.amount * 2;
            }
        } else if (bet.betType == BetType.HIGHLOW) {
            if ((bet.value == 0 && _result <= 18) || (bet.value == 1 && _result > 18)) {
                winnings = bet.amount * 2;
            }
        }
        
        if (winnings > 0) {
            payable(bet.player).transfer(winnings);
        }
        
        bet.settled = true;
        emit BetSettled(_betId, bet.player, winnings, _result);
    }
    
    function isRed(uint256 _number) public pure returns (bool) {
        uint256[18] memory redNumbers = [uint256(1), 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        for (uint256 i = 0; i < redNumbers.length; i++) {
            if (redNumbers[i] == _number) return true;
        }
        return false;
    }
    
    function fundContract() external payable onlyOwner {}
    
    function withdraw(uint256 _amount) external onlyOwner {
        payable(owner).transfer(_amount);
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    receive() external payable {}
}
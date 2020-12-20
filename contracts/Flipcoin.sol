pragma solidity 0.5.12;
import "./Ownable.sol";


contract FlipCoin is Ownable{

    uint256 contractBalance;
    string public message;
    event playerStatus(bool, uint);

    constructor() public{
        contractBalance = 0;
    }

    struct Player{
        uint countWin;
        uint countLost;
        uint sumWin;
    }

    mapping (address => Player) private players;
    address[] private creators;

    modifier costs(uint cost){
        require(msg.value >= cost);
        _;
    }

    function playFlipCoin(uint coinSide) public payable costs(.05 ether){
        uint userPlayAmount = msg.value;
        bool result;
        bool side;
        bool playerWon;
        uint winAmount;

        require (contractBalance > 2*msg.value);

        Player memory newPlayer;

        if(!exists(msg.sender)){
            insertPlayer(newPlayer);
            creators.push(msg.sender);
        }


        if (coinSide == 1){
            side = true;
        }
        else{
            side = false;
        }
        result = flipCoin();
        if (result == side){
            playerWon = true;
            winAmount = 2*userPlayAmount;
            contractBalance -= winAmount;
            updatePlayerStatus(playerWon, winAmount);
            emit playerStatus(playerWon, winAmount);
        }
        else{
            playerWon = false;
            winAmount = 0;
            contractBalance += userPlayAmount;
            updatePlayerStatus(playerWon, winAmount);
            emit playerStatus(playerWon, winAmount);
         }
    }

    function flipCoin() public view returns (bool){

        if (now % 2 == 0){
            return true;
        }
        else{
            return false;
        }
    }

    function getContractBalance() public view returns (uint){
        return address(this).balance;
    }

    function initalDepositToContract() public payable{
        contractBalance = address(this).balance;
    }

    function withdrawWinAmount(address payable playerAccount) public {
        uint toTransfer;
        address creator = msg.sender;

        toTransfer = players[creator].sumWin;

        playerAccount.transfer(toTransfer);
        resetPlayerStatus();
    }

    function insertPlayer(Player memory newPlayer) private {
        address creator = msg.sender;
        players[creator] = newPlayer;
    }

    function getPlayerStatus() public view returns(uint timesWon, uint timesLost, uint totalWinAmt){
        address creator = msg.sender;
        return (players[creator].countWin, players[creator].countLost, players[creator].sumWin);
    }
    function updatePlayerStatus(bool winResult, uint winAmount) internal {
        address creator = msg.sender;

        if (winResult == true){
            players[creator].countWin++;
            players[creator].sumWin += winAmount;
        }
        else{
            players[creator].countLost++;
        }
    }

    function resetPlayerStatus() internal {
        address creator = msg.sender;

            players[creator].countWin = 0;
            players[creator].sumWin = 0;
            players[creator].countLost = 0;

    }

    function exists(address playerAddress) public view returns (bool) {
        uint i;

	    for (i = 0; i < creators.length; i++) {
                if (creators[i] == playerAddress) {
	                 return true;
                }
        }
        return false;
    }
}

var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var contractBalance;
var winAmount;
var playerAddress;
var contractAddress = "0x3f036e609e2C00E2c240D7e378D3f7B8F1c87453";

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
        $("#contract_address").text(contractAddress);
        playerAddress = accounts[0];
        $("#player_address").text(playerAddress);
        contractInstance = new web3.eth.Contract(abi, contractAddress, {from: accounts[0]});
        console.log(contractInstance);

        contractInstance.methods.getContractBalance().call().then(function(result){
            contractBalance = result;
            $("#contract_balance").text(web3.utils.fromWei(result, "ether") + " ETHER");
        });

        $("#submit").click(inputData);
        $("#withdraw").click(withdrawWin);
        $("#refresh").click(refreshStatus);
    });
});

function inputData(){
    var playAmt = $("#input_playamount").val();
    var coinSide = $("#coinside").val();
    var playAmtWei = web3.utils.toWei(playAmt, "ether");

    //alert(" You have selected side = " + coinSide + "\n" +
    //        " and play amount of " + playAmt + " ether");

    var config = {
	value: web3.utils.toWei(playAmt, "ether")
	}

    //checkSufficientBalanceAvailable
    if (contractBalance > 2*playAmtWei){
        contractInstance.methods.playFlipCoin(coinSide).send(config)
        .on("transactionsHash", function(hash){
            console.log(hash);
        })
        .on("confirmation", function(confirmationNr){
            console.log(confirmationNr);
        })
        .on("receipt", function(receipt){
            console.log(receipt);
            //alert("Done");
            //console.log(receipt.events.playerStatus.returnValues[0]);

            let playResult = receipt.events.playerStatus.returnValues[0];
            winAmount = receipt.events.playerStatus.returnValues[1];
            if (playResult == true){
                $("#player_message").text("Congratulations. you won!");
                $("#win_amount").text(web3.utils.fromWei(winAmount, "ether") + " ETHER");
            }
            else{
                $("#player_message").text("Sorry, you lost!");
                $("#win_amount").text("0" + " ETHER");
            }
        })
    }
    else{
        alert("Your play amount exceeds available balance. Reduce the amount and play again");
    }
}

function withdrawWin(){
    //alert(playerAddress,winAmount);
    //alert(winAmount);
    contractInstance.methods.withdrawWinAmount(playerAddress, winAmount).send()
    .on("transactionsHash", function(hash){
        console.log(hash);
    })
    .on("confirmation", function(confirmationNr){
        console.log(confirmationNr);
    })
    .on("receipt", function(receipt){
        console.log(receipt);
        alert("Done");
    })
}
function refreshStatus(){
    contractInstance.methods.getPlayerStatus().call().then(function(result){
        //$("#win_count").text(result.)
        console.log(result);
        $("#win_count").text(result.timesWon);
        $("#lost_count").text(result.timesLost);
        $("#sum_won").text(web3.utils.fromWei(result.totalWinAmt, "ether") + " ETHER");
    });
    contractInstance.methods.getContractBalance().call().then(function(result){
        contractBalance = result;
        $("#contract_balance").text(web3.utils.fromWei(result, "ether") + " ETHER");
        //alert(contractBalance);
    });
}

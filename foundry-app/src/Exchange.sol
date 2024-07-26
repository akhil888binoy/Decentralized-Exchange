// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    address public tokenAddress;
    constructor(address token) ERC20("ETH TOKEN LP Token", "lpETHTOKEN"){
        require(token != address(0), "Token address passed is a null address");
        tokenAddress=token;
    }

    function getReserve() public view returns(uint256) {
        return ERC20(tokenAddress).balanceOf(address(this));
    }
    function addLiquidity(uint256 amountToken) public payable returns(uint256){
        uint256 lpTokensToMint;
        uint256 ethReserveBalance = address(this).balance;
        uint256 tokenReserveBalance = getReserve();

        ERC20 token = ERC20(tokenAddress);

        if(tokenReserveBalance == 0){
            token.transferFrom(msg.sender, address(this), amountToken);
            lpTokensToMint = ethReserveBalance;

            _mint(msg.sender, lpTokensToMint);

            return lpTokensToMint;

        }

        uint256 ethReservePriorToFunctionCall = ethReserveBalance - msg.value;
        uint256 minTokenAmountRequired = (msg.value * tokenReserveBalance)/ethReservePriorToFunctionCall;
        require(amountToken >= minTokenAmountRequired, "Insufficient amount");

        token.transferFrom(msg.sender, address(this), minTokenAmountRequired);

        lpTokensToMint=(totalSupply() * msg.value)/ethReservePriorToFunctionCall;

        _mint(msg.sender, lpTokensToMint);

        return lpTokensToMint;
    }

    function removeLiquidity(uint256 amountOfLpTokens) public  returns(uint256, uint256){

        require(amountOfLpTokens > 0 , "No enough Lp tokens");

       uint256 ethReserveBalance = address(this).balance;
       uint lpTokensTotalSupply = totalSupply();

       uint256 ethToReturn =(ethReserveBalance * amountOfLpTokens)/lpTokensTotalSupply;
       uint256 tokenToReturn = (getReserve() * amountOfLpTokens)/lpTokensTotalSupply;

       _burn(msg.sender, amountOfLpTokens);
       payable(msg.sender).transfer(ethToReturn);

       ERC20(tokenAddress).transfer(msg.sender , tokenToReturn);
        return (ethToReturn, tokenToReturn);
    }

function getOutputAmountFromSwap(
    uint256 inputAmount , 
    uint256 inputReserve,
    uint256 outputReserve
    ) public pure returns(uint256){

        require(inputReserve > 0 && outputReserve > 0,
        "Reserves must be greater than 0");

        uint256 inputAmountWithFee= inputAmount * 99;
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denomiator = (inputReserve * 100) + inputAmountWithFee;

        return numerator/denomiator;
    } 

function ethToTokenSwap(uint256 minTokensToReceive) public payable{
    uint256 tokenReserveBalance = getReserve();

    uint256 tokensToReceive = getOutputAmountFromSwap(
        msg.value,
        address(this).balance-msg.value,
        tokenReserveBalance
    );
    require(tokensToReceive >= minTokensToReceive,
    "Tokens received are less than minimum tokens expected");

    ERC20(tokenAddress).transfer(msg.sender, tokensToReceive);  
}


function tokenToEthSwap(
    uint256 tokensToSwap,
    uint256 minEthToReceive
) public {

    uint256 tokenReserveBalance = getReserve();
    uint256 ethToReceive = getOutputAmountFromSwap(
        tokensToSwap,
        tokenReserveBalance,
        address(this).balance
    );
    require(
        ethToReceive >= minEthToReceive,
        "ETH received is less than minimum Eth expected"
    );

    ERC20(tokenAddress).transferFrom(
        msg.sender,
        address(this),
        tokensToSwap
    );
    payable(msg.sender).transfer(ethToReceive);
  }

}
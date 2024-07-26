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
}
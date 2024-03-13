// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./SimpleERC20.sol"; 

contract ERC20Factory {
    function createToken(string memory name, string memory symbol, uint256 initialSupply, uint8 decimals) public {
        new SimpleERC20(
            name,
            symbol,
            decimals,
            initialSupply, 
            msg.sender
        );
    }
}

// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract USDB is ERC20 {
    constructor()ERC20("USDB", "USDB")
    {
        _mint(msg.sender, 120000 * 10**decimals());
    }

    function mint(address _to, uint _amount) external {
        
        _mint(_to, _amount);
    }
}

// SPDX-License-Identifier: UNLICENSED




pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EBSCTestToken is ERC20
{
    
    constructor() ERC20("EBSCTestToken","tEBSC")
    {
         
    }

    function decimals() public view virtual override returns (uint8) {
        return 9;
    }

    function mint (address to , uint amount) external
    {
        _mint(to,amount);
    }

    function burn ( uint amount ) external{
        _burn(msg.sender,amount);
    }
}
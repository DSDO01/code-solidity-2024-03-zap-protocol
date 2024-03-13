// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MATIC is ERC20 {
    address public admin;
    
    constructor(string memory _name, string memory _symbol, uint _amount) ERC20(_name, _symbol) {
        _mint(msg.sender, _amount);
        admin = msg.sender;
    }

    function mint(address _to, uint _amount) external{
        require(msg.sender == admin, "Only admin");
        _mint(_to, _amount);
    }

    function burn(uint _amount) external{
        _burn(msg.sender, _amount);
    }
    
}
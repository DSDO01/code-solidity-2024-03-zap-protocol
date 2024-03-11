// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestERC1155 is ERC1155, Ownable {
    uint256[] totalSuppliesOfToken = [101,201,301];
    uint256[] mintedToken = [0,0,0];
    uint256[] rates = [0.01 ether, 0.01 ether, 0.01 ether];

    constructor() ERC1155("") {}

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(uint256 id, uint256 amount) public
        payable
    {
        require(id<=totalSuppliesOfToken.length, "Token doesn't Exist");
        require(id>0, "Token id must be positive");
        uint256 index = id -1;

        require(mintedToken[index]+amount <= totalSuppliesOfToken[index], "Not ENough Supply");
        // require(msg.value > amount * rates[index], "Not Enough ether sent");

        _mint(msg.sender, id, amount, "");
        mintedToken[index]+=amount;
    }

    function withdraw() public onlyOwner
    {
        require(address(this).balance>0, "Balance is 0");
        payable(
            owner()).transfer(address(this).balance
            );
    }  
}